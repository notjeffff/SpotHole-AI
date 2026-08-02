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
    pothole_id: int
    detected_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InferenceResponse(BaseModel):
    success: bool
    detected: bool
    pothole_id: Optional[int] = None
    created_new: Optional[bool] = None
    confidence: Optional[float] = None
    status: Optional[str] = None
    bbox: Optional[dict] = None
    processing_time_ms: Optional[int] = None
    model_version: Optional[str] = None
