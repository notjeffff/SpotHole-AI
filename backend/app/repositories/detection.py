from app.repositories.base import CRUDBase
from app.models.detection import Detection
from app.schemas.detection import DetectionCreate, DetectionUpdate

class CRUDDetection(CRUDBase[Detection, DetectionCreate, DetectionUpdate]):
    pass

detection_repo = CRUDDetection(Detection)
