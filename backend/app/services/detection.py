from sqlalchemy.orm import Session
from app.services.base import ServiceBase
from app.repositories.detection import CRUDDetection, detection_repo
from app.schemas.detection import DetectionCreate, DetectionUpdate, InferenceResponse
from app.services.ai_service import ai_service
from app.services.pothole import pothole_service

class DetectionService(ServiceBase[CRUDDetection, DetectionCreate, DetectionUpdate]):
    
    def process_ai_detection(self, db: Session, detection_in: DetectionCreate) -> InferenceResponse:
        prediction = ai_service.predict(detection_in.image_path)
        
        response = InferenceResponse(
            success=True,
            detected=prediction.get("detected", False),
            processing_time_ms=prediction.get("processing_time_ms", 0),
            model_version=prediction.get("model_version", "Unknown")
        )
        
        if not response.detected:
            return response
            
        # Pothole was detected, process it
        confidence = prediction.get("confidence", 0.0)
        response.confidence = confidence
        response.bbox = prediction.get("bbox", None)
        
        # We need GPS for a valid pothole
        if not detection_in.latitude or not detection_in.longitude:
            response.success = False
            return response
            
        # Match or Create Pothole
        pothole, is_new = pothole_service.match_or_create(
            db=db,
            latitude=detection_in.latitude,
            longitude=detection_in.longitude,
            confidence=confidence
        )
        
        # Create Detection Record
        new_detection = DetectionCreate(
            pothole_id=pothole.id,
            latitude=detection_in.latitude,
            longitude=detection_in.longitude,
            gps_accuracy=detection_in.gps_accuracy,
            confidence=confidence,
            bbox_json=response.bbox,
            image_path=detection_in.image_path,
            model_version=response.model_version
        )
        
        self.create(db, obj_in=new_detection)
        
        # Populate response
        response.pothole_id = pothole.id
        response.created_new = is_new
        response.status = pothole.status.value
        
        return response

detection_service = DetectionService(detection_repo)
