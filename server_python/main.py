import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.seed import seed_database
from app.routers import auth, leads, followups, counsellors, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed
    print("[EduLead Python API] Creating SQL tables in SQLite...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    print("[EduLead Python API] Shutting down...")

app = FastAPI(
    title="EduLead API (Python + SQL)",
    description="High-performance FastAPI and SQLAlchemy backend for Admission Lead Management",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(followups.router)
app.include_router(counsellors.router)
app.include_router(reports.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": "EduLead API (Python + SQL)",
        "version": "2.0.0",
        "database": "SQLite / SQLAlchemy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }
