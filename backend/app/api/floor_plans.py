from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.schemas.floor_plan import FloorPlan, FloorPlanCreate, FloorPlanUpdate
from app.schemas.user import UserResponse
from app.services.floor_plan_service import FloorPlanService
from typing import List

router = APIRouter(prefix="/api/floor-plans", tags=["floor-plans"])


@router.post("", response_model=FloorPlan, status_code=status.HTTP_201_CREATED)
def create_floor_plan(
    floor_plan: FloorPlanCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_admin),
):
    """Create a new floor plan (Admin only)"""
    try:
        # Check if location already exists
        existing = FloorPlanService.get_floor_plan_by_location(db, floor_plan.location)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Floor plan for location '{floor_plan.location}' already exists",
            )

        db_floor_plan = FloorPlanService.create_floor_plan(db, floor_plan)
        return db_floor_plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/upsert", response_model=FloorPlan)
def upsert_floor_plan(
    location: str,
    layout_data: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_admin),
):
    """Create or update floor plan for a location (Admin only)"""
    try:
        db_floor_plan = FloorPlanService.upsert_floor_plan(db, location, layout_data)
        return db_floor_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("", response_model=List[FloorPlan])
def get_all_floor_plans(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """Get all floor plans"""
    return FloorPlanService.get_all_floor_plans(db)


@router.get("/{location}", response_model=FloorPlan)
def get_floor_plan_by_location(
    location: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """Get floor plan for a specific location"""
    floor_plan = FloorPlanService.get_floor_plan_by_location(db, location)
    if not floor_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Floor plan for location '{location}' not found",
        )
    return floor_plan


@router.put("/{floor_plan_id}", response_model=FloorPlan)
def update_floor_plan(
    floor_plan_id: int,
    floor_plan_update: FloorPlanUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_admin),
):
    """Update a floor plan (Admin only)"""
    db_floor_plan = FloorPlanService.update_floor_plan(db, floor_plan_id, floor_plan_update)
    if not db_floor_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Floor plan not found",
        )
    return db_floor_plan


@router.delete("/{floor_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_floor_plan(
    floor_plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_admin),
):
    """Delete a floor plan (Admin only)"""
    success = FloorPlanService.delete_floor_plan(db, floor_plan_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Floor plan not found",
        )
    return None


