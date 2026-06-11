import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.estimation import Estimation
from app.services.pdf_service import generate_boq_pdf
from app.services.excel_service import generate_boq_excel
from app.services.estimation_service import get_estimation, get_latest_estimation

router = APIRouter(prefix="/export", tags=["Export"])


def _get_estimation_or_latest(db: Session, estimation_id: str, user: User) -> tuple:
    """Resolve estimation_id — supports 'latest:{project_id}' shorthand."""
    if estimation_id.startswith("latest:"):
        project_id = estimation_id.split(":", 1)[1]
        estimation = get_latest_estimation(db, project_id, user)
        if not estimation:
            raise HTTPException(status_code=404, detail="No estimation found for this project")
    else:
        estimation = get_estimation(db, estimation_id, user)

    project = db.query(Project).filter(Project.id == estimation.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project, estimation


@router.get("/pdf/{estimation_id}")
def export_pdf(
    estimation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download BOQ as a professional PDF.
    Use estimation_id OR pass 'latest:{project_id}' to get the most recent.
    """
    project, estimation = _get_estimation_or_latest(db, estimation_id, current_user)

    if not estimation.boq_items:
        raise HTTPException(status_code=400, detail="No BOQ items to export. Run estimation first.")

    pdf_bytes = generate_boq_pdf(project, estimation)

    safe_name = "".join(c for c in project.name if c.isalnum() or c in " _-")[:40].strip()
    filename = f"BOQ_{safe_name}_{datetime.now().strftime('%Y%m%d')}.pdf"

    # Mark project as exported
    project.status = "exported"
    db.commit()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.get("/excel/{estimation_id}")
def export_excel(
    estimation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download BOQ as a styled Excel workbook (3 sheets).
    """
    project, estimation = _get_estimation_or_latest(db, estimation_id, current_user)

    if not estimation.boq_items:
        raise HTTPException(status_code=400, detail="No BOQ items to export. Run estimation first.")

    excel_bytes = generate_boq_excel(project, estimation)

    safe_name = "".join(c for c in project.name if c.isalnum() or c in " _-")[:40].strip()
    filename = f"BOQ_{safe_name}_{datetime.now().strftime('%Y%m%d')}.xlsx"

    # Mark project as exported
    project.status = "exported"
    db.commit()

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(excel_bytes.__len__()),
        },
    )


@router.get("/preview/{estimation_id}")
def export_preview(
    estimation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Metadata about what will be exported — used by the frontend export panel."""
    project, estimation = _get_estimation_or_latest(db, estimation_id, current_user)
    return {
        "project_name": project.name,
        "estimation_id": str(estimation.id),
        "total_cost": float(estimation.total_cost or 0),
        "item_count": len(estimation.boq_items),
        "version": estimation.version,
        "created_at": estimation.created_at.isoformat(),
        "pdf_url": f"/api/v1/export/pdf/{estimation.id}",
        "excel_url": f"/api/v1/export/excel/{estimation.id}",
    }
