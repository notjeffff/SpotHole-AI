from typing import Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.
    Automatically closes the session when the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
