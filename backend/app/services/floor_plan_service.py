from sqlalchemy.orm import Session
from app.models.floor_plan import FloorPlan
from app.models.desk import Desk
from app.schemas.floor_plan import FloorPlanCreate, FloorPlanUpdate
from typing import Optional
import json


class FloorPlanService:
    @staticmethod
    def create_floor_plan(db: Session, floor_plan: FloorPlanCreate) -> FloorPlan:
        """Create a new floor plan"""
        db_floor_plan = FloorPlan(**floor_plan.dict())
        db.add(db_floor_plan)
        db.commit()
        db.refresh(db_floor_plan)
        return db_floor_plan

    @staticmethod
    def get_floor_plan_by_location(db: Session, location: str) -> Optional[FloorPlan]:
        """Get floor plan by location"""
        return db.query(FloorPlan).filter(
            FloorPlan.location == location,
            FloorPlan.is_active == True
        ).first()

    @staticmethod
    def get_all_floor_plans(db: Session) -> list[FloorPlan]:
        """Get all active floor plans"""
        return db.query(FloorPlan).filter(FloorPlan.is_active == True).all()

    @staticmethod
    def update_floor_plan(
        db: Session, floor_plan_id: int, floor_plan_update: FloorPlanUpdate
    ) -> Optional[FloorPlan]:
        """Update a floor plan"""
        db_floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
        if not db_floor_plan:
            return None

        update_data = floor_plan_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_floor_plan, field, value)

        db.commit()
        db.refresh(db_floor_plan)
        return db_floor_plan

    @staticmethod
    def upsert_floor_plan(
        db: Session, location: str, layout_data: str
    ) -> FloorPlan:
        """Create or update floor plan for a location and auto-create desk records"""
        # Parse the layout data
        items = json.loads(layout_data)
        
        # For each item, ensure it has a corresponding desk record
        for item in items:
            item_id = item.get('id')
            item_type = item.get('type', 'desk')
            
            # Generate a unique desk name based on item ID
            desk_name = f"{location.replace(' ', '-').upper()}-{item_type.upper()}-{item_id}"
            
            # Check if desk already exists
            existing_desk = db.query(Desk).filter(
                Desk.name == desk_name,
                Desk.location == location
            ).first()
            
            if not existing_desk:
                # Create new desk record
                new_desk = Desk(
                    name=desk_name,
                    location=location,
                    desk_type="chair" if item_type == "chair" else "single",
                    is_active=True
                )
                db.add(new_desk)
                db.flush()  # Flush to get the ID
                
                # Link the item to the desk
                item['deskName'] = new_desk.name
                item['deskId'] = str(new_desk.id)
            else:
                # Link to existing desk
                item['deskName'] = existing_desk.name
                item['deskId'] = str(existing_desk.id)
        
        # Convert back to JSON with updated desk links
        updated_layout_data = json.dumps(items)
        
        # Save or update floor plan
        existing = FloorPlanService.get_floor_plan_by_location(db, location)
        
        if existing:
            existing.layout_data = updated_layout_data
            db.commit()
            db.refresh(existing)
            return existing
        else:
            floor_plan_create = FloorPlanCreate(
                location=location,
                layout_data=updated_layout_data
            )
            return FloorPlanService.create_floor_plan(db, floor_plan_create)

    @staticmethod
    def delete_floor_plan(db: Session, floor_plan_id: int) -> bool:
        """Soft delete a floor plan"""
        db_floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
        if not db_floor_plan:
            return False

        db_floor_plan.is_active = False
        db.commit()
        return True



