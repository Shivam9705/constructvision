import json
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.estimation import Estimation
from app.models.project import Project
from app.services.gemini_service import _call_gemini, _safe_parse_json
from app.services.estimation_service import get_estimation, get_latest_estimation
from app.services.project_service import get_project_by_id
from app.models.user import User
from app.utils.prompts import INTELLIGENCE_REPORT_PROMPT

logger = logging.getLogger(__name__)


def generate_intelligence_report(db: Session, project_id: str, user: User) -> dict:
    """
    Generate an AI intelligence report for the latest estimation of a project.
    Returns structured dict with executive summary, risks, timeline, recommendations.
    """
    project    = get_project_by_id(db, project_id, user)
    estimation = get_latest_estimation(db, project_id, user)

    if not estimation:
        raise HTTPException(
            status_code=404,
            detail="No estimation found. Run AI estimation first.",
        )
    if not estimation.boq_items:
        raise HTTPException(
            status_code=400,
            detail="BOQ is empty. Run AI estimation to populate it.",
        )

    # Build top items summary
    sorted_items = sorted(
        estimation.boq_items,
        key=lambda i: float(i.amount or 0),
        reverse=True
    )[:10]

    top_items_txt = "\n".join(
        f"  - {i.description[:60]}: ₹{float(i.amount or 0):,.0f}"
        for i in sorted_items
    )

    prompt = INTELLIGENCE_REPORT_PROMPT.format(
        name            = project.name,
        project_type    = project.project_type,
        city            = project.city or "Not specified",
        state           = project.state or "India",
        total_area_sqft = float(project.total_area_sqft or 0),
        num_floors      = project.num_floors or 1,
        finish_quality  = project.finish_quality or "standard",
        total_cost      = float(estimation.total_cost or 0),
        cost_per_sqft   = float(estimation.cost_per_sqft or 0),
        civil_work      = float(estimation.civil_work_cost or 0),
        finishing       = float(estimation.finishing_cost or 0),
        electrical      = float(estimation.electrical_cost or 0),
        plumbing        = float(estimation.plumbing_cost or 0),
        contingency     = float(estimation.contingency_cost or 0),
        top_items       = top_items_txt,
    )

    logger.info(f"Generating intelligence report for project: {project.name}")
    raw    = _call_gemini(prompt)
    result = _safe_parse_json(raw)

    # Attach project metadata for the frontend
    result["project_id"]   = str(project.id)
    result["project_name"] = project.name
    result["total_cost"]   = float(estimation.total_cost or 0)
    result["cost_per_sqft"]= float(estimation.cost_per_sqft or 0)
    result["generated_at"] = __import__("datetime").datetime.utcnow().isoformat()

    return result


def compare_projects(db: Session, project_ids: list[str], user: User) -> dict:
    """
    Compare 2-4 projects side by side.
    Returns structured comparison data for the frontend.
    """
    if len(project_ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 project IDs to compare")
    if len(project_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 projects can be compared")

    results = []
    for pid in project_ids:
        try:
            project    = get_project_by_id(db, pid, user)
            estimation = get_latest_estimation(db, pid, user)
        except HTTPException:
            continue

        results.append({
            "id":             str(project.id),
            "name":           project.name,
            "project_type":   project.project_type,
            "city":           project.city,
            "state":          project.state,
            "total_area_sqft":float(project.total_area_sqft or 0),
            "num_floors":     project.num_floors,
            "finish_quality": project.finish_quality,
            "status":         project.status,
            "created_at":     project.created_at.isoformat(),
            "estimation": {
                "total_cost":      float(estimation.total_cost or 0)      if estimation else None,
                "cost_per_sqft":   float(estimation.cost_per_sqft or 0)   if estimation else None,
                "civil_work_cost": float(estimation.civil_work_cost or 0) if estimation else None,
                "finishing_cost":  float(estimation.finishing_cost or 0)  if estimation else None,
                "electrical_cost": float(estimation.electrical_cost or 0) if estimation else None,
                "plumbing_cost":   float(estimation.plumbing_cost or 0)   if estimation else None,
                "contingency_cost":float(estimation.contingency_cost or 0)if estimation else None,
                "ai_confidence":   estimation.ai_confidence                if estimation else None,
                "item_count":      len(estimation.boq_items)               if estimation else 0,
            } if estimation else None,
        })

    if not results:
        raise HTTPException(status_code=404, detail="No projects found")

    return {"projects": results, "count": len(results)}
