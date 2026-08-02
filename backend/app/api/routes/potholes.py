from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.api.deps import get_pothole_service
from app.services.pothole import PotholeService
from app.schemas.pothole import PotholeCreate, PotholeUpdate, PotholeResponse

router = APIRouter()

@router.get("/", response_model=List[PotholeResponse], summary="List all potholes")
def list_potholes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    service: PotholeService = Depends(get_pothole_service)
):
    """
    Retrieve a list of potholes.
    """
    return service.list(db, skip=skip, limit=limit)

@router.get("/stats", summary="Get aggregated pothole statistics")
def get_pothole_stats(db: Session = Depends(get_db)):
    """
    Retrieve aggregated statistics for the dashboard.
    """
    from app.models.pothole import Pothole
    from app.models.enums import PotholeStatus
    
    total = db.query(Pothole).count()
    active = db.query(Pothole).filter(Pothole.status == PotholeStatus.active).count()
    detected = db.query(Pothole).filter(Pothole.status == PotholeStatus.detected).count()
    resolved = db.query(Pothole).filter(Pothole.status == PotholeStatus.resolved).count()
    
    return {
        "total": total,
        "active": active,
        "detected": detected,
        "resolved": resolved
    }

@router.get("/{id}", response_model=PotholeResponse, summary="Get a pothole by ID")
def get_pothole(
    id: int, 
    db: Session = Depends(get_db),
    service: PotholeService = Depends(get_pothole_service)
):
    """
    Retrieve a specific pothole by its ID.
    """
    pothole = service.get_by_id(db, id)
    if not pothole:
        raise HTTPException(status_code=404, detail="Pothole not found")
    return pothole

@router.post("/", response_model=PotholeResponse, status_code=status.HTTP_201_CREATED, summary="Create a pothole")
def create_pothole(
    pothole_in: PotholeCreate, 
    db: Session = Depends(get_db),
    service: PotholeService = Depends(get_pothole_service)
):
    """
    Create a new pothole record.
    """
    return service.create(db, obj_in=pothole_in)

@router.patch("/{id}", response_model=PotholeResponse, summary="Update a pothole")
def update_pothole(
    id: int, 
    pothole_in: PotholeUpdate, 
    db: Session = Depends(get_db),
    service: PotholeService = Depends(get_pothole_service)
):
    """
    Update an existing pothole.
    """
    pothole = service.get_by_id(db, id)
    if not pothole:
        raise HTTPException(status_code=404, detail="Pothole not found")
    return service.update(db, db_obj=pothole, obj_in=pothole_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a pothole")
def delete_pothole(
    id: int, 
    db: Session = Depends(get_db),
    service: PotholeService = Depends(get_pothole_service)
):
    """
    Delete a pothole by its ID.
    """
    pothole = service.get_by_id(db, id)
    if not pothole:
        raise HTTPException(status_code=404, detail="Pothole not found")
    service.delete(db, id=id)
    return None
