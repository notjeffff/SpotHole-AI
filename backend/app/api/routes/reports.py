from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.api.deps import get_report_service
from app.services.report import ReportService
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse

router = APIRouter()

@router.get("/", response_model=List[ReportResponse], summary="List all reports")
def list_reports(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_report_service)
):
    """
    Retrieve a list of reports.
    """
    return service.list(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=ReportResponse, summary="Get a report by ID")
def get_report(
    id: int, 
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_report_service)
):
    """
    Retrieve a specific report by its ID.
    """
    report = service.get_by_id(db, id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED, summary="Create a report")
def create_report(
    report_in: ReportCreate, 
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_report_service)
):
    """
    Create a new report record.
    """
    return service.create(db, obj_in=report_in)

@router.patch("/{id}", response_model=ReportResponse, summary="Update a report")
def update_report(
    id: int, 
    report_in: ReportUpdate, 
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_report_service)
):
    """
    Update an existing report.
    """
    report = service.get_by_id(db, id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return service.update(db, db_obj=report, obj_in=report_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a report")
def delete_report(
    id: int, 
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_report_service)
):
    """
    Delete a report by its ID.
    """
    report = service.get_by_id(db, id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    service.delete(db, id=id)
    return None
