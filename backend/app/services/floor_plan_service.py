from sqlalchemy.orm import Session
from app.models.floor_plan import FloorPlan
from app.models.desk import Desk
from app.schemas.floor_plan import FloorPlanCreate, FloorPlanUpdate
from typing import Optional, Dict
import json
import math


# Location short codes mapping
LOCATION_SHORT_CODES = {
    "Melbourne": "MELB",
    "Brisbane": "BRIS",
    "Auckland": "AUCK",
    "Hyderabad": "HYD",
    "Sydney": "SYD",
}


def get_location_short_code(location: str) -> str:
    """Get short code for a location. Falls back to first 4 chars uppercase if not mapped."""
    return LOCATION_SHORT_CODES.get(location, location[:4].upper())


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
        """Create or update floor plan for a location and auto-create desk records.

        Important behaviour:
        - Each *desk* item in the layout corresponds to ONE desk record in the database.
        - Any *chair* items are treated as visual parts of that same desk:
          they are linked to the nearest desk item and share the same desk record.
        - If a chair has no nearby desk (edge case), we fall back to creating
          a dedicated desk record so the item remains bookable.
        """
        # Parse the layout data
        items = json.loads(layout_data)

        # Split items by type for clearer logic
        desk_items = [item for item in items if item.get("type", "desk") == "desk"]
        chair_items = [item for item in items if item.get("type", "desk") != "desk"]

        # Map from layout item id -> Desk instance so chairs can link to the same desk
        item_desk_map: Dict[str, Desk] = {}

        # 1) Ensure each DESK item has a corresponding Desk record
        for item in desk_items:
            item_id = item.get("id")

            # Generate a unique desk name using location short code
            # Format: MELB-1, MELB-2, etc. (or MELB-001 if padded)
            location_code = get_location_short_code(location)
            desk_name = f"{location_code}-{item_id}"

            existing_desk = (
                db.query(Desk)
                .filter(Desk.name == desk_name, Desk.location == location)
                .first()
            )

            if not existing_desk:
                position_x = int(item.get("x", 0))
                position_y = int(item.get("y", 0))

                new_desk = Desk(
                    name=desk_name,
                    location=location,
                    position_x=position_x,
                    position_y=position_y,
                    desk_type="single",
                    is_active=True,
                )
                db.add(new_desk)
                db.flush()
                desk = new_desk
            else:
                desk = existing_desk

            if item_id:
                item_desk_map[item_id] = desk

            # Link the desk item itself
            item["deskName"] = desk.name
            item["deskId"] = str(desk.id)

        # 2) Link CHAIR items to the nearest DESK item so they share the same Desk record
        for item in chair_items:
            item_id = item.get("id")
            item_x = float(item.get("x", 0))
            item_y = float(item.get("y", 0))

            nearest_desk_item = None
            nearest_distance = None

            for desk_item in desk_items:
                dx = float(desk_item.get("x", 0)) - item_x
                dy = float(desk_item.get("y", 0)) - item_y
                distance = math.hypot(dx, dy)

                if nearest_distance is None or distance < nearest_distance:
                    nearest_distance = distance
                    nearest_desk_item = desk_item

            linked_desk: Optional[Desk] = None

            # If we found a nearby desk item that already has a Desk record, use it
            if nearest_desk_item is not None:
                nearest_id = nearest_desk_item.get("id")
                if nearest_id and nearest_id in item_desk_map:
                    linked_desk = item_desk_map[nearest_id]

            # Edge case: no nearby desk found – fall back to creating a dedicated Desk
            if linked_desk is None:
                location_code = get_location_short_code(location)
                fallback_name = f"{location_code}-{item_id}"
                existing_chair_desk = (
                    db.query(Desk)
                    .filter(Desk.name == fallback_name, Desk.location == location)
                    .first()
                )

                if not existing_chair_desk:
                    position_x = int(item.get("x", 0))
                    position_y = int(item.get("y", 0))

                    new_desk = Desk(
                        name=fallback_name,
                        location=location,
                        position_x=position_x,
                        position_y=position_y,
                        desk_type="chair",
                        is_active=True,
                    )
                    db.add(new_desk)
                    db.flush()
                    linked_desk = new_desk
                else:
                    linked_desk = existing_chair_desk

            # Link chair item to the resolved Desk
            if linked_desk is not None:
                item["deskName"] = linked_desk.name
                item["deskId"] = str(linked_desk.id)
                if item_id:
                    item_desk_map[item_id] = linked_desk

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



