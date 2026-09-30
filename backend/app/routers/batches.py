from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/batches", tags=["batches"])

LOCKED_STATUSES = {models.BatchStatus.processing, models.BatchStatus.recycled, models.BatchStatus.rejected}


def _next_batch_code(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(func.count(models.Batch.id)).scalar() or 0
    return f"TXT-{year}-{count + 1:04d}"


@router.get("", response_model=schemas.PaginatedBatches)
def list_batches(
    status_filter: Optional[models.BatchStatus] = Query(None, alias="status"),
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Batch)

    # Manufacturers only see their own batches; every other role sees all.
    if current_user.role == models.RoleEnum.manufacturer:
        q = q.filter(models.Batch.manufacturer_id == current_user.id)

    if status_filter:
        q = q.filter(models.Batch.status == status_filter)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.Batch.batch_code.ilike(like)) | (models.Batch.fabric_type.ilike(like))
        )

    total = q.count()
    items = (
        q.order_by(models.Batch.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"total": total, "page": page, "page_size": page_size, "items": items}


@router.post("", response_model=schemas.BatchOut, status_code=201)
def create_batch(
    payload: schemas.BatchCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in (models.RoleEnum.manufacturer, models.RoleEnum.admin):
        raise HTTPException(status_code=403, detail="Only manufacturers can create batches")

    batch = models.Batch(
        batch_code=_next_batch_code(db),
        manufacturer_id=current_user.id,
        weight_kg=payload.weight_kg,
        fabric_type=payload.fabric_type,
        notes=payload.notes,
        status=models.BatchStatus.pending,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    db.add(models.StatusHistory(
        batch_id=batch.id, old_status=None, new_status=batch.status.value,
        changed_by=current_user.id,
    ))
    db.commit()
    return batch


@router.get("/{batch_id}", response_model=schemas.BatchOut)
def get_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    if current_user.role == models.RoleEnum.manufacturer and batch.manufacturer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your batch")
    return batch


@router.put("/{batch_id}", response_model=schemas.BatchOut)
def update_batch(
    batch_id: str,
    payload: schemas.BatchUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    role = current_user.role

    if role == models.RoleEnum.manufacturer:
        if batch.manufacturer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your batch")
        if batch.status not in (models.BatchStatus.pending, models.BatchStatus.sorting):
            raise HTTPException(status_code=403, detail="Batch is locked for editing at this stage")
        if payload.weight_kg is not None:
            batch.weight_kg = payload.weight_kg
        if payload.fabric_type is not None:
            batch.fabric_type = payload.fabric_type
        if payload.notes is not None:
            batch.notes = payload.notes
        # Manufacturers may not directly set status to a locked/processed state.
        if payload.status is not None and payload.status not in (
            models.BatchStatus.pending, models.BatchStatus.sorting
        ):
            raise HTTPException(status_code=403, detail="Manufacturers cannot set that status")
        new_status = payload.status

    elif role == models.RoleEnum.operator:
        # Operators can only touch processing status/notes, not the primary batch fields.
        new_status = payload.status
        if payload.notes is not None:
            batch.notes = payload.notes
        if payload.weight_kg is not None or payload.fabric_type is not None:
            raise HTTPException(status_code=403, detail="Operators cannot edit primary batch fields")

    elif role == models.RoleEnum.admin:
        for field in ("weight_kg", "fabric_type", "notes", "image_url"):
            value = getattr(payload, field)
            if value is not None:
                setattr(batch, field, value)
        new_status = payload.status

    else:  # analyst
        raise HTTPException(status_code=403, detail="Read-only role")

    if new_status is not None and new_status != batch.status:
        db.add(models.StatusHistory(
            batch_id=batch.id, old_status=batch.status.value, new_status=new_status.value,
            changed_by=current_user.id,
        ))
        batch.status = new_status

    db.commit()
    db.refresh(batch)
    return batch


@router.delete("/{batch_id}", status_code=204)
def delete_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    if current_user.role == models.RoleEnum.admin:
        pass
    elif current_user.role == models.RoleEnum.manufacturer:
        if batch.manufacturer_id != current_user.id or batch.status != models.BatchStatus.pending:
            raise HTTPException(status_code=403, detail="Can only delete your own Pending batches")
    else:
        raise HTTPException(status_code=403, detail="Not permitted to delete batches")

    db.delete(batch)
    db.commit()
    return None
