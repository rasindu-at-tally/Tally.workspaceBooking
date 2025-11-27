export type UserRole = 'user' | 'admin';

export type BookingStatus = 'active' | 'cancelled';
export type RoomBookingStatus = 'active' | 'cancelled';

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

// Meeting Room Types
export interface MeetingRoom {
  id: string;
  room_name: string;
  room_number: string;
  location: string;
  capacity: number;
  has_projector: boolean;
  has_video_conf: boolean;
  has_whiteboard: boolean;
  has_screen_share: boolean;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingRoomRequest {
  room_name: string;
  room_number: string;
  location: string;
  capacity: number;
  has_projector?: boolean;
  has_video_conf?: boolean;
  has_whiteboard?: boolean;
  has_screen_share?: boolean;
  description?: string;
}

export interface UpdateMeetingRoomRequest {
  room_name?: string;
  room_number?: string;
  location?: string;
  capacity?: number;
  has_projector?: boolean;
  has_video_conf?: boolean;
  has_whiteboard?: boolean;
  has_screen_share?: boolean;
  is_active?: boolean;
  description?: string;
}

export interface MeetingRoomFilter {
  location?: string;
  min_capacity?: number;
  has_projector?: boolean;
  has_video_conf?: boolean;
  has_whiteboard?: boolean;
  has_screen_share?: boolean;
  is_active?: boolean;
}

// Room Booking Types
export interface RoomBooking {
  id: string;
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  meeting_subject?: string;
  attendee_count?: number;
  status: RoomBookingStatus;
  cancelled_at?: string;
  cancelled_by_user_id?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomBookingWithDetails extends RoomBooking {
  room_name?: string;
  room_number?: string;
  location?: string;
  user_name?: string;
  user_email?: string;
}

export interface CreateRoomBookingRequest {
  room_id: string;
  start_time: string;
  end_time: string;
  meeting_subject?: string;
  attendee_count?: number;
}

export interface CancelRoomBookingRequest {
  cancellation_reason?: string;
}

export interface RoomAvailabilityRequest {
  start_time: string;
  end_time: string;
}

export interface RoomAvailabilityResponse {
  room_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// MS Teams Types
export interface MeetingInfo {
  subject: string;
  start: string;
  end: string;
  duration: number;
  attendee_count: number;
  is_online: boolean;
  location?: string;
  online_meeting_url?: string;
}

export interface RoomRecommendation {
  room: MeetingRoom;
  score: number;
  match_reasons: string[];
}

export interface MeetingWithRecommendations {
  meeting: MeetingInfo;
  recommendations: RoomRecommendation[];
}

export interface MSTeamsStatus {
  connected: boolean;
  expires_at?: string;
  is_expired?: boolean;
  demo_mode?: boolean;
}



