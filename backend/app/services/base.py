from typing import Generic, TypeVar, List, Optional, Any
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase

RepoType = TypeVar("RepoType", bound=CRUDBase)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class ServiceBase(Generic[RepoType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, repo: RepoType):
        self.repo = repo

    def get_by_id(self, db: Session, id: Any):
        return self.repo.get_by_id(db, id)

    def list(self, db: Session, skip: int = 0, limit: int = 100):
        return self.repo.list(db, skip=skip, limit=limit)

    def create(self, db: Session, obj_in: CreateSchemaType):
        return self.repo.create(db, obj_in=obj_in)

    def update(self, db: Session, db_obj: Any, obj_in: UpdateSchemaType):
        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def delete(self, db: Session, id: int):
        return self.repo.delete(db, id=id)
