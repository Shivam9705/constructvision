import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from app.config import settings
from app.database import engine, Base
from app.models import User, Project, Estimation, BOQItem  # noqa
from app.routers import auth, projects, estimation, export, intelligence

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("constructvision")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (Alembic handles prod migrations)
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs("exports", exist_ok=True)
    logger.info(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} started")
    logger.info(f"   Debug: {settings.DEBUG} | Origins: {settings.ALLOWED_ORIGINS}")
    yield
    logger.info("🛑 Shutting down gracefully")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## ConstructVision AI — API

AI-powered construction cost estimation platform for Indian civil engineers.

### Key endpoints
- `POST /api/v1/auth/register` — Create account
- `POST /api/v1/auth/login` — Get JWT token
- `POST /api/v1/projects` — Create project
- `POST /api/v1/estimate` — **Run AI estimation** (Gemini)
- `GET  /api/v1/export/pdf/{id}` — Download BOQ as PDF
- `GET  /api/v1/export/excel/{id}` — Download BOQ as Excel
- `GET  /api/v1/intelligence/report/{project_id}` — AI intelligence report
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Authentication"},
        {"name": "Projects"},
        {"name": "Estimation"},
        {"name": "Export"},
        {"name": "Intelligence"},
        {"name": "Health"},
    ],
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # needed for file downloads
)

# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({ms:.0f}ms)")
    response.headers["X-Response-Time"] = f"{ms:.0f}ms"
    return response

# ── Static files ──────────────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,         prefix="/api/v1")
app.include_router(projects.router,     prefix="/api/v1")
app.include_router(estimation.router,   prefix="/api/v1")
app.include_router(export.router,       prefix="/api/v1")
app.include_router(intelligence.router, prefix="/api/v1")

# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )

# ── Health & root ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check")
def health_check():
    """Render pings this every 30s to keep the service warm."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }

@app.get("/", tags=["Health"], include_in_schema=False)
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
