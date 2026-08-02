from app.services.base import ServiceBase
from app.repositories.pothole import CRUDPothole, pothole_repo
from app.schemas.pothole import PotholeCreate, PotholeUpdate

class PotholeService(ServiceBase[CRUDPothole, PotholeCreate, PotholeUpdate]):
    pass

pothole_service = PotholeService(pothole_repo)
