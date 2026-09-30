import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Integer, DateTime, ForeignKey, Enum, JSON, Text
)
from sqlalchemy.orm import relationship

from .database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    manufacturer = "manufacturer"
    operator = "operator"
    analyst = "analyst"


class BatchStatus(str, enum.Enum):
    pending = "Pending"
    sorting = "Sorting"
    processing = "Processing"
    recycled = "Recycled"
    rejected = "Rejected"


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.manufacturer)
    organization = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    batches = relationship("Batch", back_populates="manufacturer")


class Batch(Base):
    __tablename__ = "batches"

    id = Column(String, primary_key=True, default=gen_uuid)
    batch_code = Column(String, unique=True, index=True)
    manufacturer_id = Column(String, ForeignKey("users.id"), nullable=False)
    weight_kg = Column(Float, nullable=False)
    fabric_type = Column(String, nullable=True)  # manual entry, Milestone 1
    status = Column(Enum(BatchStatus), default=BatchStatus.pending)
    image_url = Column(String, nullable=True)
    predicted_composition = Column(JSON, nullable=True)  # filled by ML service, Milestone 2
    circularity_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    manufacturer = relationship("User", back_populates="batches")
    history = relationship("StatusHistory", back_populates="batch", cascade="all, delete-orphan")


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    batch_id = Column(String, ForeignKey("batches.id"), nullable=False)
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    changed_by = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="history")
