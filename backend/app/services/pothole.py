import math
from datetime import datetime
from typing import Tuple
from sqlalchemy.orm import Session
from app.services.base import ServiceBase
from app.repositories.pothole import CRUDPothole, pothole_repo
from app.schemas.pothole import PotholeCreate, PotholeUpdate
from app.models.enums import PotholeStatus
from app.models.pothole import Pothole
from app.core.settings import settings

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class PotholeService(ServiceBase[CRUDPothole, PotholeCreate, PotholeUpdate]):
    
    def match_or_create(
        self, 
        db: Session, 
        latitude: float, 
        longitude: float, 
        confidence: float
    ) -> Tuple[Pothole, bool]:
        """
        Finds a nearby active/detected pothole within MATCH_RADIUS_METERS.
        If found, updates it and returns (pothole, False).
        If not found, creates a new one and returns (pothole, True).
        """
        # Fetch all open potholes
        open_potholes = db.query(Pothole).filter(
            Pothole.status.in_([PotholeStatus.detected, PotholeStatus.active])
        ).all()
        
        closest_pothole = None
        min_dist = float('inf')
        
        for p in open_potholes:
            dist = haversine(latitude, longitude, p.latitude, p.longitude)
            if dist <= settings.MATCH_RADIUS_METERS and dist < min_dist:
                closest_pothole = p
                min_dist = dist
                
        if closest_pothole:
            # Update existing pothole
            closest_pothole.source_count += 1
            closest_pothole.last_detected_at = datetime.utcnow()
            
            if closest_pothole.confidence_score is None or confidence > closest_pothole.confidence_score:
                closest_pothole.confidence_score = confidence
                
            # Lifecycle Promotion
            if closest_pothole.status == PotholeStatus.detected:
                if closest_pothole.source_count >= 2 or closest_pothole.confidence_score >= settings.CONFIDENCE_THRESHOLD:
                    closest_pothole.status = PotholeStatus.active
                    
            db.commit()
            db.refresh(closest_pothole)
            return closest_pothole, False
            
        else:
            # Create new pothole
            new_status = PotholeStatus.active if confidence >= settings.CONFIDENCE_THRESHOLD else PotholeStatus.detected
            pothole_in = PotholeCreate(
                latitude=latitude,
                longitude=longitude,
                status=new_status,
                confidence_score=confidence
            )
            new_pothole = self.create(db, obj_in=pothole_in)
            return new_pothole, True

pothole_service = PotholeService(pothole_repo)
