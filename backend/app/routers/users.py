from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_roles(models.RoleEnum.admin)),
):
    return db.query(models.User).all()


@router.put("/profile", response_model=schemas.UserOut)
def update_profile(
    payload: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.organization is not None:
        current_user.organization = payload.organization
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/{user_id}/role", response_model=schemas.UserOut)
def update_role(
    user_id: str,
    payload: schemas.RoleUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_roles(models.RoleEnum.admin)),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user
