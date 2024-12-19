from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from contextlib import asynccontextmanager

from .routers import projects, images
from .database import init_db

# Use contextmanager to initialize the database
@asynccontextmanager
async def lifespan(app: FastAPI):    
    await init_db()
    yield
    print("server is stopping")


app = FastAPI(title="Image Annotation API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for serving images
uploads_path = Path("uploads")
uploads_path.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(images.router, prefix="/images", tags=["images"])
