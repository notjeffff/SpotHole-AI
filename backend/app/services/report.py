from app.services.base import ServiceBase
from app.repositories.report import CRUDReport, report_repo
from app.schemas.report import ReportCreate, ReportUpdate

class ReportService(ServiceBase[CRUDReport, ReportCreate, ReportUpdate]):
    pass

report_service = ReportService(report_repo)
