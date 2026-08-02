from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.settings import settings
from app.core.exceptions import add_exception_handlers
from app.api.routes import health
from app.database import engine, Base
import app.models  # Import models to ensure they are registered with Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic if necessary
def create_app() -> FastAPI:
    """
    Application factory pattern.
    Creates and configures the FastAPI application instance.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # For development; restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register global exceptions
    add_exception_handlers(app)

    # Include routers
    app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])

    return app

app = create_app()
