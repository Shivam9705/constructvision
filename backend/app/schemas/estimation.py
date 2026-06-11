from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional


# ── BOQ Item ──────────────────────────────────────────────────────────────────

class BOQItemOut(BaseModel):
    id: UUID
    estimation_id: UUID
    category: str
    item_code: Optional[str]
    description: str
    unit: str
    quantity: Optional[float]
    rate: Optional[float]
    amount: Optional[float]
    is_user_edited: bool
    sort_order: int

    model_config = {"from_attributes": True}


class BOQItemUpdate(BaseModel):
    quantity: Optional[float] = None
    rate: Optional[float] = None
    description: Optional[str] = None


class BOQItemCreate(BaseModel):
    category: str = "civil"
    description: str
    unit: str = "ls"
    quantity: float = 1.0
    rate: float = 0.0

    @field_validator("description")
    @classmethod
    def desc_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Description cannot be blank")
        return v.strip()


# ── Estimation ────────────────────────────────────────────────────────────────

class EstimationOut(BaseModel):
    id: UUID
    project_id: UUID
    total_cost: Optional[float]
    cost_per_sqft: Optional[float]
    civil_work_cost: Optional[float]
    finishing_cost: Optional[float]
    electrical_cost: Optional[float]
    plumbing_cost: Optional[float]
    contingency_pct: Optional[float]
    contingency_cost: Optional[float]
    ai_confidence: Optional[str]
    ai_notes: Optional[str]
    version: int
    created_at: datetime
    boq_items: list[BOQItemOut] = []

    model_config = {"from_attributes": True}


class RunEstimationRequest(BaseModel):
    project_id: str
    use_blueprint: bool = False


# ── Material Schedule (derived from BOQ) ──────────────────────────────────────

class MaterialItem(BaseModel):
    material: str
    specification: str
    unit: str
    quantity: float
    rate: float
    amount: float
    category: str


class MaterialScheduleOut(BaseModel):
    estimation_id: str
    items: list[MaterialItem]
    total_material_cost: float
