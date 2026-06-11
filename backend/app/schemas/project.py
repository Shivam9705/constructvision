from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal

ProjectType = Literal["residential", "commercial", "industrial", "institutional"]
FinishQuality = Literal["basic", "standard", "premium", "luxury"]
ProjectStatus = Literal["draft", "estimated", "exported"]


class ProjectCreate(BaseModel):
    name: str
    project_type: ProjectType = "residential"
    city: Optional[str] = None
    state: Optional[str] = None
    total_area_sqft: Optional[float] = None
    num_floors: int = 1
    finish_quality: FinishQuality = "standard"
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Project name cannot be blank")
        return v.strip()

    @field_validator("num_floors")
    @classmethod
    def floors_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Number of floors must be at least 1")
        if v > 200:
            raise ValueError("Number of floors cannot exceed 200")
        return v

    @field_validator("total_area_sqft")
    @classmethod
    def area_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Total area must be positive")
        return v


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    project_type: Optional[ProjectType] = None
    city: Optional[str] = None
    state: Optional[str] = None
    total_area_sqft: Optional[float] = None
    num_floors: Optional[int] = None
    finish_quality: Optional[FinishQuality] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    project_type: str
    city: Optional[str]
    state: Optional[str]
    total_area_sqft: Optional[float]
    num_floors: int
    finish_quality: str
    description: Optional[str]
    blueprint_url: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListOut(BaseModel):
    projects: list[ProjectOut]
    total: int
