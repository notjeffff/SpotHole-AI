from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.api.deps import get_detection_service, get_ai_service
from app.services.detection import DetectionService
from app.services.ai_service import AIService
from app.schemas.detection import DetectionCreate, DetectionUpdate, DetectionResponse

router = APIRouter()

@router.get("/", response_model=List[DetectionResponse], summary="List all detections")
def list_detections(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    service: DetectionService = Depends(get_detection_service)
):
    """
    Retrieve a list of detections.
    """
    return service.list(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=DetectionResponse, summary="Get a detection by ID")
def get_detection(
    id: int, 
    db: Session = Depends(get_db),
    service: DetectionService = Depends(get_detection_service)
):
    """
    Retrieve a specific detection by its ID.
    """
    detection = service.get_by_id(db, id)
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    return detection

@router.post("/", status_code=status.HTTP_201_CREATED, summary="Run inference on a detection frame")
def create_detection(
    detection_in: DetectionCreate, 
    ai: AIService = Depends(get_ai_service)
):
    """
    Phase 3E: Intercept frame, run YOLO inference, and return results.
    Bypassing database writes completely for now.
    """
    if not detection_in.image_path:
        raise HTTPException(status_code=400, detail="Missing image_path payload")
        
    prediction = ai.predict(detection_in.image_path)
    return prediction

@router.patch("/{id}", response_model=DetectionResponse, summary="Update a detection")
def update_detection(
    id: int, 
    detection_in: DetectionUpdate, 
    db: Session = Depends(get_db),
    service: DetectionService = Depends(get_detection_service)
):
    """
    Update an existing detection.
    """
    detection = service.get_by_id(db, id)
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    return service.update(db, db_obj=detection, obj_in=detection_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a detection")
def delete_detection(
    id: int, 
    db: Session = Depends(get_db),
    service: DetectionService = Depends(get_detection_service)
):
    """
    Delete a detection by its ID.
    """
    detection = service.get_by_id(db, id)
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    service.delete(db, id=id)
    return None
