from fastapi import Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.pothole import PotholeService, pothole_service
from app.services.detection import DetectionService, detection_service
from app.services.report import ReportService, report_service

def get_pothole_service() -> PotholeService:
    return pothole_service

def get_detection_service() -> DetectionService:
    return detection_service

def get_report_service() -> ReportService:
    return report_service
