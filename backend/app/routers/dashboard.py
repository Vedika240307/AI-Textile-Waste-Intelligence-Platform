from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Batch)
    if current_user.role == models.RoleEnum.manufacturer:
        q = q.filter(models.Batch.manufacturer_id == current_user.id)

    total_batches = q.count()
    total_weight = db.query(func.coalesce(func.sum(models.Batch.weight_kg), 0.0))
    if current_user.role == models.RoleEnum.manufacturer:
        total_weight = total_weight.filter(models.Batch.manufacturer_id == current_user.id)
    total_weight = total_weight.scalar() or 0.0

    by_status = {}
    rows = (
        q.with_entities(models.Batch.status, func.count(models.Batch.id))
        .group_by(models.Batch.status)
        .all()
    )
    for status_val, count in rows:
        by_status[status_val.value] = count

    avg_score_q = db.query(func.avg(models.Batch.circularity_score)).filter(
        models.Batch.circularity_score.isnot(None)
    )
    if current_user.role == models.RoleEnum.manufacturer:
        avg_score_q = avg_score_q.filter(models.Batch.manufacturer_id == current_user.id)
    avg_score = avg_score_q.scalar()

    return {
        "total_batches": total_batches,
        "total_weight_kg": total_weight,
        "by_status": by_status,
        "average_circularity_score": avg_score,
    }
