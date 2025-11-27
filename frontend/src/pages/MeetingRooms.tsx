import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { MeetingRoom, MeetingRoomFilter, RoomBooking } from '../types';
import { Layout } from '@/components/Layout';
import { RoomBookingModal } from '@/components/RoomBookingModal';
import { MapPin, Users, Monitor, Video, PenLine, Cast, Search, SlidersHorizontal, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { getToken } from '@/lib/auth';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

export default function MeetingRooms() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [filters, setFilters] = useState<MeetingRoomFilter>({
    is_active: true,
  });

  // Fetch all meeting rooms
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['meeting-rooms', filters],
    queryFn: async () => {
      const token = getToken();
      const params = new URLSearchParams();
      
      if (filters.location) params.append('location', filters.location);
      if (filters.min_capacity) params.append('min_capacity', filters.min_capacity.toString());
      if (filters.has_projector !== undefined) params.append('has_projector', filters.has_projector.toString());
      if (filters.has_video_conf !== undefined) params.append('has_video_conf', filters.has_video_conf.toString());
      if (filters.has_whiteboard !== undefined) params.append('has_whiteboard', filters.has_whiteboard.toString());
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      
      const { data } = await axios.get<MeetingRoom[]>(
        `${API_BASE}/api/meeting-rooms?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  // Fetch bookings for the selected date to check availability
  const { data: bookingsForDate = [] } = useQuery({
    queryKey: ['room-bookings-by-date', selectedDate],
    queryFn: async () => {
      const token = getToken();
      const startOfDay = `${selectedDate}T00:00:00`;
      const endOfDay = `${selectedDate}T23:59:59`;
      
      const { data } = await axios.get<RoomBooking[]>(
        `${API_BASE}/api/room-bookings?start_date=${startOfDay}&end_date=${endOfDay}&status=active`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  // Fetch locations for filter dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ['meeting-room-locations'],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get<string[]>(
        `${API_BASE}/api/meeting-rooms/locations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  // Check if a room is booked for the selected date
  const isRoomBooked = (roomId: string) => {
    return bookingsForDate.some(booking => booking.room_id === roomId);
  };

  // Get available room count
  const availableRooms = rooms.filter(room => !isRoomBooked(room.id));

  const handleBookRoom = (room: MeetingRoom) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">
              Meeting Rooms
            </h1>
            <p className="mt-2 text-slate-500">
              Find and book the perfect space for your next meeting
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                {availableRooms.length} available
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <XCircle className="h-4 w-4" />
                {rooms.length - availableRooms.length} booked
              </span>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-800">Filter Rooms</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Date Selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Booking Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={filters.location || ''}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined })}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Min Capacity
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={filters.min_capacity || ''}
                  onChange={(e) => setFilters({ ...filters, min_capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                  placeholder="Any"
                />
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Required Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                <label className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                  filters.has_projector 
                    ? 'border-teal-400 bg-teal-50 text-teal-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={filters.has_projector || false}
                    onChange={(e) => setFilters({ ...filters, has_projector: e.target.checked ? true : undefined })}
                    className="sr-only"
                  />
                  <Monitor className="h-4 w-4" />
                  Projector
                </label>
                <label className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                  filters.has_video_conf 
                    ? 'border-teal-400 bg-teal-50 text-teal-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={filters.has_video_conf || false}
                    onChange={(e) => setFilters({ ...filters, has_video_conf: e.target.checked ? true : undefined })}
                    className="sr-only"
                  />
                  <Video className="h-4 w-4" />
                  Video Conf
                </label>
                <label className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                  filters.has_whiteboard 
                    ? 'border-teal-400 bg-teal-50 text-teal-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={filters.has_whiteboard || false}
                    onChange={(e) => setFilters({ ...filters, has_whiteboard: e.target.checked ? true : undefined })}
                    className="sr-only"
                  />
                  <PenLine className="h-4 w-4" />
                  Whiteboard
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Display */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 px-6 py-3">
          <Calendar className="h-5 w-5 text-cyan-600" />
          <span className="text-sm font-medium text-cyan-800">
            Showing availability for <span className="font-bold">{format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}</span>
          </span>
        </div>

        {/* Meeting Rooms Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600"></div>
            <p className="mt-4 text-slate-500">Finding available rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
            <Search className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-medium text-slate-600">No rooms found</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const booked = isRoomBooked(room.id);
              
              return (
                <div
                  key={room.id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
                    booked 
                      ? 'border-red-200 bg-red-50/30 opacity-75' 
                      : 'border-slate-200 hover:shadow-xl hover:shadow-teal-100 hover:-translate-y-1'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute right-4 top-4 flex flex-col gap-2 items-end">
                    {booked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        <XCircle className="h-3 w-3" />
                        Booked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        Available
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
                      <MapPin className="h-3 w-3" />
                      {room.location}
                    </span>
                  </div>

                  {/* Room Info */}
                  <div className="mb-4 pr-24">
                    <h3 className={`text-xl font-bold transition-colors ${
                      booked ? 'text-slate-500' : 'text-slate-800 group-hover:text-teal-600'
                    }`}>
                      {room.room_name}
                    </h3>
                    <p className="text-sm text-slate-400 font-mono">{room.room_number}</p>
                  </div>

                  {/* Capacity */}
                  <div className="mb-4 flex items-center gap-2 text-slate-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-sm">
                      <span className="font-semibold text-slate-800">{room.capacity}</span> people
                    </span>
                  </div>

                  {/* Description */}
                  {room.description && (
                    <p className="mb-4 text-sm text-slate-500 line-clamp-2">{room.description}</p>
                  )}

                  {/* Amenities - flex-grow to push button to bottom */}
                  <div className="mb-4 flex flex-wrap gap-2 flex-grow">
                    {room.has_projector && (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        booked ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <Monitor className="h-3.5 w-3.5" />
                        Projector
                      </span>
                    )}
                    {room.has_video_conf && (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        booked ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-700'
                      }`}>
                        <Video className="h-3.5 w-3.5" />
                        Video
                      </span>
                    )}
                    {room.has_whiteboard && (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        booked ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'
                      }`}>
                        <PenLine className="h-3.5 w-3.5" />
                        Whiteboard
                      </span>
                    )}
                    {room.has_screen_share && (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        booked ? 'bg-slate-100 text-slate-500' : 'bg-purple-50 text-purple-700'
                      }`}>
                        <Cast className="h-3.5 w-3.5" />
                        Screen Share
                      </span>
                    )}
                  </div>

                  {/* Book Button - Always at bottom */}
                  <div className="mt-auto pt-4">
                    {booked ? (
                      <button 
                        disabled
                        className="w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                      >
                        Not Available
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBookRoom(room)}
                        className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:from-teal-600 hover:to-cyan-600 active:scale-[0.98]"
                      >
                        Book This Room
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <RoomBookingModal
        room={selectedRoom}
        selectedDate={selectedDate}
        isOpen={isBookingModalOpen}
        onClose={handleCloseModal}
      />
    </Layout>
  );
}
