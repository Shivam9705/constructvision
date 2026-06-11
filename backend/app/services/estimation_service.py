import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.project import Project
from app.models.estimation import Estimation, BOQItem
from app.models.user import User
from app.services.gemini_service import generate_cost_estimation, analyze_blueprint
from app.services.project_service import get_project_by_id

logger = logging.getLogger(__name__)

CATEGORY_MAP = {
    "civil": "Civil Work",
    "civil_work": "Civil Work",
    "finishing": "Finishing",
    "electrical": "Electrical",
    "plumbing": "Plumbing",
    "external": "External Work",
    "external_work": "External Work",
}

SORT_ORDER = {
    "civil": 1,
    "civil_work": 1,
    "plumbing": 2,
    "electrical": 3,
    "finishing": 4,
    "external": 5,
    "external_work": 5,
}


def run_estimation(db: Session, project_id: str, user: User, use_blueprint: bool = False) -> Estimation:
    """
    Main entry point for Day 3.
    1. Load project
    2. Optionally load blueprint image
    3. Call Gemini
    4. Parse and store in DB
    5. Mark project as 'estimated'
    """
    project = get_project_by_id(db, project_id, user)

    project_data = {
        "name": project.name,
        "project_type": project.project_type,
        "city": project.city or "Not specified",
        "state": project.state or "India",
        "total_area_sqft": float(project.total_area_sqft or 1000),
        "num_floors": project.num_floors or 1,
        "finish_quality": project.finish_quality or "standard",
        "description": project.description or "",
    }

    # ── Run AI ────────────────────────────────────────────────────────────────
    try:
        if use_blueprint and project.blueprint_url:
            file_path = project.blueprint_url.lstrip("/")
            try:
                with open(file_path, "rb") as f:
                    image_bytes = f.read()
                blueprint_analysis = analyze_blueprint(image_bytes, project_data)
                # Inject blueprint context into description
                project_data["description"] += f"\n\nBLUEPRINT ANALYSIS: {blueprint_analysis.get('layout_description', '')}. {blueprint_analysis.get('estimation_adjustments', '')}"
            except Exception as e:
                logger.warning(f"Blueprint analysis failed, proceeding without image: {e}")

        ai_result = generate_cost_estimation(project_data)

    except Exception as e:
        logger.error(f"Gemini estimation failed for project {project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI estimation failed: {str(e)}. Please try again.",
        )

    # ── Deactivate previous estimations (keep history) ────────────────────────
    prev_version = db.query(Estimation).filter(
        Estimation.project_id == project.id
    ).count()

    # ── Persist estimation ────────────────────────────────────────────────────
    breakdown = ai_result.get("breakdown", {})

    estimation = Estimation(
        project_id=project.id,
        total_cost=ai_result.get("total_cost_inr"),
        cost_per_sqft=ai_result.get("cost_per_sqft"),
        civil_work_cost=breakdown.get("civil_work") or breakdown.get("civil"),
        finishing_cost=breakdown.get("finishing"),
        electrical_cost=breakdown.get("electrical"),
        plumbing_cost=breakdown.get("plumbing"),
        contingency_pct=5.0,
        contingency_cost=breakdown.get("contingency"),
        ai_confidence=ai_result.get("confidence", "medium"),
        ai_notes=ai_result.get("notes"),
        gemini_raw=ai_result.get("_raw", ""),
        version=prev_version + 1,
    )
    db.add(estimation)
    db.flush()  # Get estimation.id before inserting BOQ items

    # ── Persist BOQ items ──────────────────────────────────────────────────────
    boq_items = ai_result.get("boq_items", [])
    # Sort by category order
    boq_items.sort(key=lambda x: SORT_ORDER.get(x.get("category", "civil"), 9))

    for idx, item in enumerate(boq_items):
        raw_cat = item.get("category", "civil").lower().strip()
        db_item = BOQItem(
            estimation_id=estimation.id,
            category=raw_cat,
            item_code=item.get("item_code", f"XX-{idx+1:03d}"),
            description=item.get("description", ""),
            unit=item.get("unit", "ls"),
            quantity=item.get("quantity"),
            rate=item.get("rate_inr"),
            amount=item.get("amount_inr"),
            sort_order=idx,
        )
        db.add(db_item)

    # ── Update project status ──────────────────────────────────────────────────
    project.status = "estimated"

    db.commit()
    db.refresh(estimation)
    logger.info(f"Estimation {estimation.id} created: ₹{estimation.total_cost:,.0f}")
    return estimation


def get_estimation(db: Session, estimation_id: str, user: User) -> Estimation:
    estimation = (
        db.query(Estimation)
        .join(Project)
        .filter(
            Estimation.id == estimation_id,
            Project.user_id == user.id,
        )
        .first()
    )
    if not estimation:
        raise HTTPException(status_code=404, detail="Estimation not found")
    return estimation


def get_project_estimations(db: Session, project_id: str, user: User) -> list[Estimation]:
    project = get_project_by_id(db, project_id, user)
    return (
        db.query(Estimation)
        .filter(Estimation.project_id == project.id)
        .order_by(Estimation.created_at.desc())
        .all()
    )


def get_latest_estimation(db: Session, project_id: str, user: User) -> Estimation | None:
    project = get_project_by_id(db, project_id, user)
    return (
        db.query(Estimation)
        .filter(Estimation.project_id == project.id)
        .order_by(Estimation.created_at.desc())
        .first()
    )


def update_boq_item(db: Session, item_id: str, quantity: float | None, rate: float | None, user: User) -> BOQItem:
    item = (
        db.query(BOQItem)
        .join(Estimation)
        .join(Project)
        .filter(BOQItem.id == item_id, Project.user_id == user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="BOQ item not found")

    if quantity is not None:
        item.quantity = quantity
    if rate is not None:
        item.rate = rate

    # Recompute amount
    if item.quantity and item.rate:
        item.amount = round(float(item.quantity) * float(item.rate), 2)

    item.is_user_edited = True
    db.commit()
    db.refresh(item)

    # Recompute estimation totals
    _recompute_totals(db, item.estimation_id)
    return item


def _recompute_totals(db: Session, estimation_id) -> None:
    """After a user edits a BOQ item, recompute the estimation totals."""
    estimation = db.query(Estimation).filter(Estimation.id == estimation_id).first()
    if not estimation:
        return

    items = db.query(BOQItem).filter(BOQItem.estimation_id == estimation_id).all()

    cat_totals: dict[str, float] = {}
    for item in items:
        amt = float(item.amount or 0)
        cat = item.category.lower()
        cat_totals[cat] = cat_totals.get(cat, 0) + amt

    subtotal = sum(cat_totals.values())
    contingency = round(subtotal * float(estimation.contingency_pct or 5) / 100, 2)
    total = round(subtotal + contingency, 2)

    estimation.total_cost = total
    estimation.contingency_cost = contingency
    estimation.civil_work_cost = cat_totals.get("civil", cat_totals.get("civil_work", 0))
    estimation.finishing_cost = cat_totals.get("finishing", 0)
    estimation.electrical_cost = cat_totals.get("electrical", 0)
    estimation.plumbing_cost = cat_totals.get("plumbing", 0)

    project = db.query(Project).filter(Project.id == estimation.project_id).first()
    if project and project.total_area_sqft:
        estimation.cost_per_sqft = round(total / float(project.total_area_sqft), 2)

    db.commit()


def add_boq_item(db: Session, estimation_id: str, payload, user: User) -> BOQItem:
    """Add a custom line item to an existing estimation."""
    estimation = get_estimation(db, estimation_id, user)

    # Get next sort order
    max_order = db.query(BOQItem).filter(
        BOQItem.estimation_id == estimation.id
    ).count()

    # Auto-generate item code
    cat_prefix = {"civil": "CV", "finishing": "FN", "electrical": "EL",
                  "plumbing": "PL", "external": "EX"}.get(payload.category.lower(), "XX")
    item_code = f"{cat_prefix}-C{max_order + 1:02d}"

    item = BOQItem(
        estimation_id=estimation.id,
        category=payload.category.lower(),
        item_code=item_code,
        description=payload.description,
        unit=payload.unit,
        quantity=payload.quantity,
        rate=payload.rate,
        amount=round(payload.quantity * payload.rate, 2),
        is_user_edited=True,
        sort_order=max_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    _recompute_totals(db, estimation.id)
    return item


def delete_boq_item(db: Session, item_id: str, user: User) -> None:
    """Remove a BOQ line item."""
    item = (
        db.query(BOQItem)
        .join(Estimation)
        .join(Project)
        .filter(BOQItem.id == item_id, Project.user_id == user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="BOQ item not found")

    estimation_id = item.estimation_id
    db.delete(item)
    db.commit()
    _recompute_totals(db, estimation_id)


def get_material_schedule(db: Session, estimation_id: str, user: User) -> dict:
    """
    Derive a material schedule from BOQ items.
    Groups similar materials and returns consolidated quantities.
    """
    estimation = get_estimation(db, estimation_id, user)
    items = estimation.boq_items

    # Material mappings — map BOQ descriptions to material names
    MATERIAL_KEYWORDS = {
        "cement": ("Cement OPC 53 Grade", "bags (50kg)"),
        "steel": ("TMT Steel Fe-500", "MT"),
        "brick": ("Fly Ash Brick 230x110x70mm", "nos"),
        "sand": ("River Sand / M-Sand", "cum"),
        "aggregate": ("Coarse Aggregate 20mm", "cum"),
        "concrete": ("Ready Mix Concrete", "cum"),
        "tile": ("Vitrified/Ceramic Tiles", "sqm"),
        "paint": ("Exterior/Interior Paint", "ltr"),
        "pipe": ("CPVC/PVC Pipes", "rmt"),
        "wire": ("Electrical Cables", "rmt"),
        "door": ("Door Frame & Shutter", "nos"),
        "window": ("Aluminium Window", "nos"),
        "waterproof": ("Waterproofing Compound", "kg"),
        "plaster": ("Cement Plaster", "sqm"),
        "rcc": ("RCC M20 Grade Concrete", "cum"),
        "pcc": ("PCC M15 Grade Concrete", "cum"),
        "wood": ("Seasoned Teak/Hardwood", "cum"),
        "glass": ("Float Glass 5mm", "sqm"),
    }

    materials = []
    seen = set()

    for item in items:
        desc_lower = item.description.lower()
        for keyword, (mat_name, mat_unit) in MATERIAL_KEYWORDS.items():
            if keyword in desc_lower and mat_name not in seen:
                seen.add(mat_name)
                materials.append({
                    "material": mat_name,
                    "specification": item.description[:80],
                    "unit": item.unit,
                    "quantity": float(item.quantity or 0),
                    "rate": float(item.rate or 0),
                    "amount": float(item.amount or 0),
                    "category": item.category,
                })
                break

    total = sum(m["amount"] for m in materials)
    return {
        "estimation_id": str(estimation_id),
        "items": materials,
        "total_material_cost": total,
    }
