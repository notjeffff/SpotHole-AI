from datetime import datetime
from typing import Optional
from sqlalchemy import func, String, Float, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.enums import Severity

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    pothole_id: Mapped[int] = mapped_column(ForeignKey("potholes.id"), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    severity_user_reported: Mapped[Severity] = mapped_column(SAEnum(Severity))
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    pothole: Mapped["Pothole"] = relationship("Pothole", back_populates="reports")
