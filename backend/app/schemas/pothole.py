from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.enums import PotholeStatus, Severity
from .detection import DetectionResponse
from .report import ReportResponse

class PotholeBase(BaseModel):
    latitude: float
    longitude: float
    status: PotholeStatus = PotholeStatus.detected
    severity: Optional[Severity] = None
    confidence_score: Optional[float] = None
    source_count: int = 1

class PotholeCreate(PotholeBase):
    pass

class PotholeUpdate(BaseModel):
    status: Optional[PotholeStatus] = None
    severity: Optional[Severity] = None
    confidence_score: Optional[float] = None
    source_count: Optional[int] = None
    last_detected_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None

class PotholeResponse(PotholeBase):
    id: int
    first_detected_at: datetime
    last_detected_at: datetime
    resolved_at: Optional[datetime]
    archived_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # We leave detections and reports out of the base response by default 
    # to prevent deep nesting, but they can be included in extended models if needed.

    model_config = ConfigDict(from_attributes=True)

class PotholeResponseDetailed(PotholeResponse):
    detections: List[DetectionResponse] = []
    reports: List[ReportResponse] = []
