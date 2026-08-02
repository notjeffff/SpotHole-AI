from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class DetectionBase(BaseModel):
    pothole_id: int
    latitude: float
    longitude: float
    gps_accuracy: Optional[float] = None
    confidence: float
    bbox_json: Optional[Dict[str, Any]] = None
    image_path: Optional[str] = None
    model_version: Optional[str] = None

class DetectionCreate(DetectionBase):
    pass

class DetectionUpdate(BaseModel):
    # Detections are largely immutable, but we might update a few fields
    confidence: Optional[float] = None
    bbox_json: Optional[Dict[str, Any]] = None
    image_path: Optional[str] = None

class DetectionResponse(DetectionBase):
    id: int
    detected_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
