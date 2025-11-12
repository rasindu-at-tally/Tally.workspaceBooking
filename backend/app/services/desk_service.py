"""Desk service"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.desk import Desk
from app.models.user import User
from app.schemas.desk import DeskCreate, DeskUpdate
from app.services.audit_service import AuditService


class DeskService:
    """Desk management service"""
    
    @staticmethod
    def create_desk(
        db: Session,
        user: User,
        desk_data: DeskCreate,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Desk:
        """Create a new desk (admin only)"""
        new_desk = Desk(
            name=desk_data.name,
            location=desk_data.location,
            position_x=desk_data.position_x,
            position_y=desk_data.position_y,
            desk_type=desk_data.desk_type,
            description=desk_data.description,
            is_active=desk_data.is_active,
        )
        
        db.add(new_desk)
        db.flush()
        
        # Create audit log
        AuditService.log_action(
            db=db,
            user_id=user.id,
            action="desk_created",
            entity_type="desk",
            entity_id=new_desk.id,
            metadata={
                "name": desk_data.name,
                "location": desk_data.location,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )
        
        db.commit()
        db.refresh(new_desk)
        return new_desk
    
    @staticmethod
    def update_desk(
        db: Session,
        user: User,
        desk_id: UUID,
        desk_data: DeskUpdate,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Desk:
        """Update a desk (admin only)"""
        desk = db.query(Desk).filter(Desk.id == desk_id).first()
        if not desk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Desk not found",
            )
        
        # Update fields
        update_data = desk_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(desk, field, value)
        
        # Create audit log
        AuditService.log_action(
            db=db,
            user_id=user.id,
            action="desk_updated",
            entity_type="desk",
            entity_id=desk.id,
            metadata=update_data,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        
        db.commit()
        db.refresh(desk)
        return desk
    
    @staticmethod
    def delete_desk(
        db: Session,
        user: User,
        desk_id: UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        """Delete a desk (admin only)"""
        desk = db.query(Desk).filter(Desk.id == desk_id).first()
        if not desk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Desk not found",
            )
        
        # Create audit log before deletion
        AuditService.log_action(
            db=db,
            user_id=user.id,
            action="desk_deleted",
            entity_type="desk",
            entity_id=desk.id,
            metadata={
                "name": desk.name,
                "location": desk.location,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )
        
        db.delete(desk)
        db.commit()
    
    @staticmethod
    def get_all_desks(
        db: Session,
        location: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Desk]:
        """Get all desks with optional filters"""
        query = db.query(Desk)
        
        if location:
            query = query.filter(Desk.location == location)
        
        if is_active is not None:
            query = query.filter(Desk.is_active == is_active)
        
        return query.order_by(Desk.location, Desk.name).all()
    
    @staticmethod
    def get_desk_by_id(db: Session, desk_id: UUID) -> Optional[Desk]:
        """Get a desk by ID"""
        return db.query(Desk).filter(Desk.id == desk_id).first()
    
    @staticmethod
    def get_locations(db: Session) -> List[str]:
        """Get all unique locations"""
        locations = db.query(Desk.location).distinct().order_by(Desk.location).all()
        return [loc[0] for loc in locations]

