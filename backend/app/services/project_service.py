import os
import uuid
import shutil
from typing import Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.config import settings

# Allowed blueprint image types
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"}
MAX_FILE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def get_projects(db: Session, user: User) -> list[Project]:
    return (
        db.query(Project)
        .filter(Project.user_id == user.id)
        .order_by(desc(Project.updated_at))
        .all()
    )


def get_project_by_id(db: Session, project_id: str, user: User) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def create_project(db: Session, payload: ProjectCreate, user: User) -> Project:
    project = Project(
        user_id=user.id,
        name=payload.name,
        project_type=payload.project_type,
        city=payload.city,
        state=payload.state,
        total_area_sqft=payload.total_area_sqft,
        num_floors=payload.num_floors,
        finish_quality=payload.finish_quality,
        description=payload.description,
        status="draft",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(
    db: Session, project_id: str, payload: ProjectUpdate, user: User
) -> Project:
    project = get_project_by_id(db, project_id, user)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: str, user: User) -> None:
    project = get_project_by_id(db, project_id, user)

    # Clean up uploaded file if exists
    if project.blueprint_url:
        file_path = project.blueprint_url.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(project)
    db.commit()


async def upload_blueprint(
    db: Session, project_id: str, file: UploadFile, user: User
) -> Project:
    project = get_project_by_id(db, project_id, user)

    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Use: JPEG, PNG, WebP, or PDF",
        )

    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"{project_id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Remove old file if exists
    if project.blueprint_url:
        old_path = project.blueprint_url.lstrip("/")
        if os.path.exists(old_path) and old_path != file_path:
            os.remove(old_path)

    project.blueprint_url = f"/{file_path}"
    db.commit()
    db.refresh(project)
    return project


def get_dashboard_stats(db: Session, user: User) -> dict:
    """Summary stats for the dashboard header."""
    projects = db.query(Project).filter(Project.user_id == user.id).all()

    total = len(projects)
    by_status = {"draft": 0, "estimated": 0, "exported": 0}
    by_type = {}

    for p in projects:
        by_status[p.status] = by_status.get(p.status, 0) + 1
        by_type[p.project_type] = by_type.get(p.project_type, 0) + 1

    return {
        "total_projects": total,
        "draft": by_status["draft"],
        "estimated": by_status["estimated"],
        "exported": by_status["exported"],
        "by_type": by_type,
    }
