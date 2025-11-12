export type UserRole = 'user' | 'admin';

export type BookingStatus = 'active' | 'cancelled';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Desk {
  id: string;
  name: string;
  location: string;
  position_x: number;
  position_y: number;
  desk_type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  desk_id: string;
  booking_date: string;
  status: BookingStatus;
  cancelled_at?: string;
  cancelled_by_user_id?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingDetail extends Booking {
  user: User;
  desk: Desk;
  cancelled_by?: User;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface CreateBookingRequest {
  desk_id: string;
  booking_date: string;
}

export interface CancelBookingRequest {
  cancellation_reason?: string;
}

export interface CreateDeskRequest {
  name: string;
  location: string;
  position_x: number;
  position_y: number;
  desk_type: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDeskRequest {
  name?: string;
  location?: string;
  position_x?: number;
  position_y?: number;
  desk_type?: string;
  description?: string;
  is_active?: boolean;
}

