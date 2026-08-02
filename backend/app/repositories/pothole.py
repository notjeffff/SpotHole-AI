from app.repositories.base import CRUDBase
from app.models.pothole import Pothole
from app.schemas.pothole import PotholeCreate, PotholeUpdate

class CRUDPothole(CRUDBase[Pothole, PotholeCreate, PotholeUpdate]):
    pass

pothole_repo = CRUDPothole(Pothole)
