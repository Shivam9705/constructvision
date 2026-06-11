from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.estimation import (
    RunEstimationRequest, EstimationOut,
    BOQItemUpdate, BOQItemOut, BOQItemCreate,
    MaterialScheduleOut,
)
from app.services import estimation_service

router = APIRouter(prefix="/estimate", tags=["Estimation"])


@router.post("", response_model=EstimationOut, status_code=status.HTTP_201_CREATED)
def run_estimation(
    payload: RunEstimationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run Gemini AI estimation. Takes 15–45s. Returns full BOQ."""
    return estimation_service.run_estimation(
        db=db, project_id=payload.project_id,
        user=current_user, use_blueprint=payload.use_blueprint,
    )


@router.get("/project/{project_id}", response_model=list[EstimationOut])
def get_project_estimations(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return estimation_service.get_project_estimations(db, project_id, current_user)


@router.get("/project/{project_id}/latest", response_model=EstimationOut)
def get_latest_estimation(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    estimation = estimation_service.get_latest_estimation(db, project_id, current_user)
    if not estimation:
        raise HTTPException(status_code=404, detail="No estimation found for this project")
    return estimation


@router.get("/{estimation_id}", response_model=EstimationOut)
def get_estimation(
    estimation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return estimation_service.get_estimation(db, estimation_id, current_user)


@router.patch("/boq/{item_id}", response_model=BOQItemOut)
def update_boq_item(
    item_id: str,
    payload: BOQItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Edit quantity or rate — auto-recomputes amount and estimation totals."""
    return estimation_service.update_boq_item(
        db, item_id, payload.quantity, payload.rate, current_user
    )


@router.post("/{estimation_id}/items", response_model=BOQItemOut, status_code=status.HTTP_201_CREATED)
def add_boq_item(
    estimation_id: str,
    payload: BOQItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a custom line item to the BOQ."""
    return estimation_service.add_boq_item(db, estimation_id, payload, current_user)


@router.delete("/boq/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_boq_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a BOQ line item."""
    estimation_service.delete_boq_item(db, item_id, current_user)


@router.get("/{estimation_id}/materials", response_model=MaterialScheduleOut)
def get_material_schedule(
    estimation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Derive material schedule from BOQ items."""
    return estimation_service.get_material_schedule(db, estimation_id, current_user)
