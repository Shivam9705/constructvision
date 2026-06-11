import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name            = Column(String(500), nullable=False)
    project_type    = Column(String(100), nullable=False, default="residential")
    location        = Column(String(255))
    city            = Column(String(100))
    state           = Column(String(100))
    total_area_sqft = Column(Numeric(12, 2))
    num_floors      = Column(Integer, default=1)
    finish_quality  = Column(String(50), default="standard")
    description     = Column(Text)
    blueprint_url   = Column(String(500))
    status          = Column(String(50), default="draft")
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner           = relationship("User", back_populates="projects")
    estimations     = relationship("Estimation", back_populates="project",
                                   cascade="all, delete-orphan",
                                   order_by="Estimation.created_at.desc()")

    def __repr__(self):
        return f"<Project {self.name}>"
