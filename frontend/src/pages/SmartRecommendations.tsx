import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MeetingWithRecommendations, CreateRoomBookingRequest, MSTeamsStatus } from '../types';
import { format } from 'date-fns';
import { useToast } from '@/components/Toast';
import { getToken } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import { Sparkles, Clock, Users, Timer, Video, MapPin, Check, Link2, Calendar, ExternalLink } from 'lucide-react';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

export default function SmartRecommendations() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: teamsStatus, isLoading: statusLoading } = useQuery<MSTeamsStatus>({
    queryKey: ['teams-status'],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}/api/teams/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  const { data: meetingsData = [], isLoading } = useQuery({
    queryKey: ['meeting-recommendations'],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get<MeetingWithRecommendations[]>(
        `${API_BASE}/api/teams/meetings/recommendations?use_demo=false`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: teamsStatus?.connected === true,
  });

  const bookRoomMutation = useMutation({
    mutationFn: async ({ roomId, meeting }: { roomId: string; meeting: any }) => {
      const token = getToken();
      const bookingData: CreateRoomBookingRequest = {
        room_id: roomId,
        start_time: meeting.start,
        end_time: meeting.end,
        meeting_subject: meeting.subject,
        attendee_count: meeting.attendee_count,
      };
      await axios.post(
        `${API_BASE}/api/room-bookings`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: 'Room booked successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['my-room-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting-recommendations'] });
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to book room. Please try again.',
      });
    },
  });

  const connectTeams = async () => {
    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}/api/teams/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = data.auth_url;
    } catch (error: any) {
      if (error.response?.status === 503) {
        showToast({
          type: 'error',
          message: 'MS Teams integration is not configured. Please contact your administrator.',
        });
      } else {
        showToast({
          type: 'error',
          message: 'Failed to connect to Microsoft Teams. Please try again.',
        });
      }
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return dateString;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-slate-400 to-slate-500';
  };

  // Show loading state
  if (statusLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Show connect prompt if not connected
  if (!teamsStatus?.connected) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-cyan-600">
                AI Recommendations
              </h1>
            </div>
            <p className="text-slate-500">
              Smart meeting room suggestions based on your calendar
            </p>
          </div>

          {/* Connect to Teams Prompt */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 py-16 px-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 mb-6">
              <Link2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Connect Microsoft Teams</h2>
            <p className="text-slate-600 text-center max-w-md mb-8">
              To get AI-powered room recommendations based on your calendar, please connect your Microsoft Teams account.
            </p>
            <button
              onClick={connectTeams}
              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
            >
              <ExternalLink className="h-5 w-5" />
              Connect to Microsoft Teams
            </button>
            <p className="mt-6 text-sm text-slate-400">
              We'll sync your calendar to provide personalized room suggestions
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 mb-4">
                <Calendar className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Calendar Sync</h3>
              <p className="text-sm text-slate-500">
                Automatically reads your Teams calendar to find meetings that need rooms
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 mb-4">
                <Sparkles className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Smart Matching</h3>
              <p className="text-sm text-slate-500">
                AI suggests the best rooms based on attendee count, amenities, and availability
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 mb-4">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">One-Click Booking</h3>
              <p className="text-sm text-slate-500">
                Book recommended rooms instantly with a single click
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-cyan-600">
                AI Recommendations
              </h1>
            </div>
            <p className="text-slate-500">
              Smart meeting room suggestions based on your calendar
            </p>
          </div>
        </div>

        {/* Teams Connected Banner */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Connected to Microsoft Teams</p>
              <p className="text-sm text-emerald-600">
                Your calendar is synced and recommendations are personalized
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
              <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-violet-600" />
            </div>
            <p className="mt-4 text-slate-500">Analyzing your meetings...</p>
          </div>
        ) : meetingsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-20">
            <Calendar className="h-16 w-16 text-slate-300" />
            <p className="mt-4 text-lg font-medium text-slate-600">No meetings found</p>
            <p className="mt-1 text-sm text-slate-400">No meetings today that need room recommendations</p>
          </div>
        ) : (
          <div className="space-y-6">
            {meetingsData.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Meeting Header */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{item.meeting.subject}</h2>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {formatTime(item.meeting.start)} - {formatTime(item.meeting.end)}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Users className="h-4 w-4 text-slate-400" />
                          {item.meeting.attendee_count} attendees
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Timer className="h-4 w-4 text-slate-400" />
                          {item.meeting.duration} min
                        </span>
                        {item.meeting.is_online && (
                          <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            <Video className="h-3.5 w-3.5" />
                            Online Meeting
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    Recommended Rooms
                  </h3>
                  {item.recommendations.length === 0 ? (
                    <p className="text-slate-500">No available rooms found for this meeting.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {item.recommendations.map((rec, recIdx) => (
                        <div
                          key={recIdx}
                          className="group relative overflow-hidden rounded-xl border-2 border-slate-100 bg-white p-5 transition-all duration-300 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100"
                        >
                          {/* Score Badge */}
                          <div className="absolute -right-8 -top-8 h-24 w-24">
                            <div className={`absolute bottom-4 left-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${getScoreColor(rec.score)} text-white shadow-lg`}>
                              <div className="text-center">
                                <div className="text-lg font-bold leading-none">{Math.round(rec.score)}</div>
                                <div className="text-[10px] opacity-80">%</div>
                              </div>
                            </div>
                          </div>

                          {/* Room Info */}
                          <div className="mb-3 pr-12">
                            <h4 className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
                              {rec.room.room_name}
                            </h4>
                            <p className="text-sm text-slate-400 font-mono">{rec.room.room_number}</p>
                          </div>

                          {/* Location & Capacity */}
                          <div className="mb-4 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              <MapPin className="h-3 w-3" />
                              {rec.room.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              <Users className="h-3 w-3" />
                              {rec.room.capacity} seats
                            </span>
                          </div>

                          {/* Match Reasons */}
                          <div className="mb-4 space-y-1.5">
                            {rec.match_reasons.slice(0, 3).map((reason, reasonIdx) => (
                              <div key={reasonIdx} className="flex items-start gap-2 text-xs text-slate-600">
                                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>

                          {/* Book Button */}
                          <button
                            onClick={() => bookRoomMutation.mutate({ roomId: rec.room.id, meeting: item.meeting })}
                            disabled={bookRoomMutation.isPending}
                            className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-50"
                          >
                            {bookRoomMutation.isPending ? 'Booking...' : 'Book This Room'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
