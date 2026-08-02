from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import Severity

class ReportBase(BaseModel):
    pothole_id: int
    latitude: float
    longitude: float
    severity_user_reported: Severity
    description: Optional[str] = None
    image_path: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    severity_user_reported: Optional[Severity] = None
    description: Optional[str] = None
    image_path: Optional[str] = None

class ReportResponse(ReportBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
