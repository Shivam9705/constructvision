from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.intelligence_service import (
    generate_intelligence_report,
    compare_projects,
)

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])


class CompareRequest(BaseModel):
    project_ids: list[str]


@router.get("/report/{project_id}")
def get_intelligence_report(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a full AI intelligence report for a project.
    Includes executive summary, cost analysis, risk assessment,
    timeline estimate, and recommendations.
    Takes 10–25 seconds.
    """
    return generate_intelligence_report(db, project_id, current_user)


@router.post("/compare")
def compare_projects_endpoint(
    payload: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Compare 2–4 projects side by side."""
    return compare_projects(db, payload.project_ids, current_user)
