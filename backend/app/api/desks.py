"""Desk management routes"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.schemas.desk import DeskCreate, DeskUpdate, DeskResponse
from app.services.desk_service import DeskService
from app.models.user import User

router = APIRouter(prefix="/desks", tags=["desks"])


@router.get("", response_model=List[DeskResponse])
def get_desks(
    location: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all desks with optional filters"""
    desks = DeskService.get_all_desks(db, location=location, is_active=is_active)
    return [DeskResponse.model_validate(desk) for desk in desks]


@router.get("/locations", response_model=List[str])
def get_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all unique locations"""
    return DeskService.get_locations(db)


@router.get("/{desk_id}", response_model=DeskResponse)
def get_desk(
    desk_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific desk by ID"""
    desk = DeskService.get_desk_by_id(db, desk_id)
    if not desk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Desk not found",
        )
    return DeskResponse.model_validate(desk)


@router.post("", response_model=DeskResponse, status_code=status.HTTP_201_CREATED)
def create_desk(
    desk_data: DeskCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new desk (admin only)"""
    desk = DeskService.create_desk(
        db,
        current_user,
        desk_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return DeskResponse.model_validate(desk)


@router.put("/{desk_id}", response_model=DeskResponse)
def update_desk(
    desk_id: UUID,
    desk_data: DeskUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a desk (admin only)"""
    desk = DeskService.update_desk(
        db,
        current_user,
        desk_id,
        desk_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return DeskResponse.model_validate(desk)


@router.delete("/{desk_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_desk(
    desk_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a desk (admin only)"""
    DeskService.delete_desk(
        db,
        current_user,
        desk_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return None

