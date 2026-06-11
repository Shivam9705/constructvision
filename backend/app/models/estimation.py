import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, Integer,
    Numeric, Text, Boolean, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Estimation(Base):
    __tablename__ = "estimations"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id        = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Cost totals
    total_cost        = Column(Numeric(15, 2))
    cost_per_sqft     = Column(Numeric(10, 2))
    civil_work_cost   = Column(Numeric(15, 2))
    finishing_cost    = Column(Numeric(15, 2))
    electrical_cost   = Column(Numeric(15, 2))
    plumbing_cost     = Column(Numeric(15, 2))
    contingency_pct   = Column(Numeric(5, 2), default=5.0)
    contingency_cost  = Column(Numeric(15, 2))

    # AI metadata
    ai_confidence     = Column(String(20))          # low / medium / high
    ai_notes          = Column(Text)
    gemini_raw        = Column(Text)                # raw JSON from Gemini (debug)
    version           = Column(Integer, default=1)

    created_at        = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project           = relationship("Project", back_populates="estimations")
    boq_items         = relationship("BOQItem", back_populates="estimation",
                                     cascade="all, delete-orphan",
                                     order_by="BOQItem.sort_order")

    def __repr__(self):
        return f"<Estimation ₹{self.total_cost} for project {self.project_id}>"


class BOQItem(Base):
    __tablename__ = "boq_items"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estimation_id   = Column(UUID(as_uuid=True), ForeignKey("estimations.id", ondelete="CASCADE"), nullable=False)

    category        = Column(String(100), nullable=False)   # civil / electrical / plumbing / finishing / external
    item_code       = Column(String(50))                    # e.g. CV-001
    description     = Column(String(500), nullable=False)
    unit            = Column(String(50), nullable=False)    # sqm / cum / rmt / nos / kg / ls
    quantity        = Column(Numeric(12, 3))
    rate            = Column(Numeric(10, 2))
    amount          = Column(Numeric(15, 2))
    is_user_edited  = Column(Boolean, default=False)
    sort_order      = Column(Integer, default=0)

    created_at      = Column(DateTime, default=datetime.utcnow)

    estimation      = relationship("Estimation", back_populates="boq_items")

    def __repr__(self):
        return f"<BOQItem {self.item_code}: {self.description[:40]}>"
