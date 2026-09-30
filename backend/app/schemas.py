from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, EmailStr, ConfigDict

from .models import RoleEnum, BatchStatus


# ---------- Auth / Users ----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    organization: Optional[str] = None
    role: RoleEnum = RoleEnum.manufacturer


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: RoleEnum
    organization: Optional[str] = None
    created_at: datetime


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None


class RoleUpdate(BaseModel):
    role: RoleEnum


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Batches ----------

class BatchCreate(BaseModel):
    weight_kg: float
    fabric_type: Optional[str] = None
    notes: Optional[str] = None


class BatchUpdate(BaseModel):
    weight_kg: Optional[float] = None
    fabric_type: Optional[str] = None
    status: Optional[BatchStatus] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None


class BatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_code: str
    manufacturer_id: str
    weight_kg: float
    fabric_type: Optional[str] = None
    status: BatchStatus
    image_url: Optional[str] = None
    predicted_composition: Optional[Dict[str, Any]] = None
    circularity_score: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PaginatedBatches(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[BatchOut]


# ---------- Dashboard ----------

class DashboardSummary(BaseModel):
    total_batches: int
    total_weight_kg: float
    by_status: Dict[str, int]
    average_circularity_score: Optional[float] = None
