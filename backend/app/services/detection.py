from app.services.base import ServiceBase
from app.repositories.detection import CRUDDetection, detection_repo
from app.schemas.detection import DetectionCreate, DetectionUpdate

class DetectionService(ServiceBase[CRUDDetection, DetectionCreate, DetectionUpdate]):
    pass

detection_service = DetectionService(detection_repo)
