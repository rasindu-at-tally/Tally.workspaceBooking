from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FloorPlanBase(BaseModel):
    location: str
    layout_data: str  # JSON string


class FloorPlanCreate(FloorPlanBase):
    pass


class FloorPlanUpdate(BaseModel):
    location: Optional[str] = None
    layout_data: Optional[str] = None
    is_active: Optional[bool] = None


class FloorPlan(FloorPlanBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True



