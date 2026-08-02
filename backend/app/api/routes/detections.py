from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.api.deps import get_detection_service
from app.services.detection import DetectionService
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

@router.post("/", response_model=DetectionResponse, status_code=status.HTTP_201_CREATED, summary="Create a detection")
def create_detection(
    detection_in: DetectionCreate, 
    db: Session = Depends(get_db),
    service: DetectionService = Depends(get_detection_service)
):
    """
    Create a new detection record.
    """
    return service.create(db, obj_in=detection_in)

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
