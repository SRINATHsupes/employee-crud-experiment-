from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, nullable=False)
    action = Column(String, nullable=False)

    entity = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)

    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
