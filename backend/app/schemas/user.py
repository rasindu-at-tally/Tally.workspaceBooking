"""User schemas"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str
    role: Optional[UserRole] = UserRole.USER
    location: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    location: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    role: UserRole
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse



