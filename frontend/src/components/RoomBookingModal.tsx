import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, MapPin, Users, Calendar, Clock, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { MeetingRoom, CreateRoomBookingRequest } from '@/types';
import { useToast } from '@/components/Toast';
import { getToken } from '@/lib/auth';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

interface RoomBookingModalProps {
  room: MeetingRoom | null;
  selectedDate: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomBookingModal({ room, selectedDate, isOpen, onClose }: RoomBookingModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [meetingSubject, setMeetingSubject] = useState('');
  const [attendeeCount, setAttendeeCount] = useState<number>(1);

  const bookRoomMutation = useMutation({
    mutationFn: async (bookingData: CreateRoomBookingRequest) => {
      const token = getToken();
      const { data } = await axios.post(
        `${API_BASE}/api/room-bookings`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: `${room?.room_name} booked successfully for ${format(new Date(selectedDate), 'MMM dd, yyyy')}`,
      });
      queryClient.invalidateQueries({ queryKey: ['meeting-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-bookings-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['my-room-bookings'] });
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to book room. Please try again.';
      if (message.includes('ROOM_NOT_AVAILABLE') || message.includes('already booked')) {
        setError('This room is already booked for the selected time. Please choose another time or room.');
      } else {
        setError(message);
      }
    },
  });

  const handleClose = () => {
    setError('');
    setMeetingSubject('');
    setAttendeeCount(1);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    // Book for the full day (9 AM to 6 PM)
    const startTime = `${selectedDate}T09:00:00`;
    const endTime = `${selectedDate}T18:00:00`;

    const bookingData: CreateRoomBookingRequest = {
      room_id: room.id,
      start_time: startTime,
      end_time: endTime,
      meeting_subject: meetingSubject || `Booking for ${room.room_name}`,
      attendee_count: attendeeCount,
    };

    bookRoomMutation.mutate(bookingData);
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Book Meeting Room</h2>
            <p className="mt-1 text-sm text-slate-500">Reserve this room for the day</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Room Info */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-teal-50 p-6">
          <h3 className="text-lg font-bold text-slate-800">{room.room_name}</h3>
          <p className="text-sm text-slate-500 font-mono">{room.room_number}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
              <MapPin className="h-4 w-4 text-cyan-600" />
              {room.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
              <Users className="h-4 w-4 text-cyan-600" />
              {room.capacity} people
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar className="h-4 w-4 text-slate-400" />
              Booking Date
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
              {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              <Clock className="inline h-3 w-3 mr-1" />
              Full day booking (9:00 AM - 6:00 PM)
            </p>
          </div>

          {/* Meeting Subject */}
          <div>
            <label htmlFor="subject" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="h-4 w-4 text-slate-400" />
              Meeting Subject (optional)
            </label>
            <input
              id="subject"
              type="text"
              value={meetingSubject}
              onChange={(e) => setMeetingSubject(e.target.value)}
              placeholder="e.g., Team Standup, Client Meeting"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 placeholder-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Attendee Count */}
          <div>
            <label htmlFor="attendees" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="h-4 w-4 text-slate-400" />
              Number of Attendees
            </label>
            <input
              id="attendees"
              type="number"
              min="1"
              max={room.capacity}
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 1)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Maximum capacity: {room.capacity} people
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookRoomMutation.isPending}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-700 hover:to-cyan-800 disabled:opacity-50"
            >
              {bookRoomMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Booking...
                </span>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

