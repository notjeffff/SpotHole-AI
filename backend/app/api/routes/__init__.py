from .health import router as health_router
from .potholes import router as potholes_router
from .detections import router as detections_router
from .reports import router as reports_router

__all__ = ["health_router", "potholes_router", "detections_router", "reports_router"]
