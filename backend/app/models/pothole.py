from datetime import datetime
from typing import List, Optional
from sqlalchemy import func, String, Float, Integer, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.enums import PotholeStatus, Severity

class Pothole(Base):
    __tablename__ = "potholes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    latitude: Mapped[float] = mapped_column(Float, index=True)
    longitude: Mapped[float] = mapped_column(Float, index=True)
    status: Mapped[PotholeStatus] = mapped_column(SAEnum(PotholeStatus), default=PotholeStatus.detected)
    severity: Mapped[Optional[Severity]] = mapped_column(SAEnum(Severity), nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    source_count: Mapped[int] = mapped_column(Integer, default=1)
    
    first_detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    last_detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    detections: Mapped[List["Detection"]] = relationship("Detection", back_populates="pothole", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="pothole", cascade="all, delete-orphan")
