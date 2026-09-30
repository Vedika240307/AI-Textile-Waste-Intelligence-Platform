from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, users, batches, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    description="Backend for tracking textile waste batches through sorting, processing, and recycling.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(batches.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "textile-waste-platform-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}
