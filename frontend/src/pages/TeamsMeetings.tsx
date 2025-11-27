import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Layout } from '@/components/Layout';
import type { MeetingInfo, MSTeamsStatus } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/components/Toast';
import { getToken } from '@/lib/auth';
import { Link2, Calendar, Clock, Users, Video, MapPin, ExternalLink, Check, CalendarDays, Shield } from 'lucide-react';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

export default function TeamsMeetings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Show a success toast if redirected after connecting Teams
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('teams_connected') === 'true') {
      showToast({
        type: 'success',
        message: 'Microsoft Teams connected successfully.',
      });
      navigate('/teams', { replace: true });
    }
    if (params.get('error')) {
      showToast({
        type: 'error',
        message: 'Failed to connect to Microsoft Teams. Please try again.',
      });
      navigate('/teams', { replace: true });
    }
  }, [location.search, navigate, showToast]);

  // Check Teams connection status
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

  // Load today's meetings from Teams (only when connected)
  const { data: meetings = [], isLoading } = useQuery<MeetingInfo[]>({
    queryKey: ['teams-meetings-today'],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get<MeetingInfo[]>(
        `${API_BASE}/api/teams/meetings/today?use_demo=false`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: teamsStatus?.connected === true,
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
          message: 'Microsoft Teams integration is not configured. Please contact your administrator.',
        });
      } else {
        showToast({
          type: 'error',
          message: 'Failed to start Microsoft Teams connection.',
        });
      }
    }
  };

  const disconnectTeams = async () => {
    try {
      const token = getToken();
      await axios.delete(`${API_BASE}/api/teams/disconnect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({
        type: 'success',
        message: 'Microsoft Teams disconnected successfully.',
      });
      // Refetch status
      window.location.reload();
    } catch {
      showToast({
        type: 'error',
        message: 'Failed to disconnect Microsoft Teams.',
      });
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return dateString;
    }
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
            <h1 className="text-3xl font-bold text-cyan-600">Microsoft Teams Meetings</h1>
            <p className="mt-2 text-gray-600">
              Connect your Microsoft Teams account to view and manage your meetings
            </p>
          </div>

          {/* Connect to Teams Prompt */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 mb-6">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Connect Microsoft Teams</h2>
            <p className="text-slate-600 text-center max-w-md mb-8">
              Connect your Microsoft Teams account to view your calendar, upcoming meetings, and join calls directly from this app.
            </p>
            <button
              onClick={connectTeams}
              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
            >
              <ExternalLink className="h-5 w-5" />
              Connect to Microsoft Teams
            </button>
            <p className="mt-6 text-sm text-slate-400">
              Secure OAuth connection - we only read your calendar
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 mb-4">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">View Meetings</h3>
              <p className="text-sm text-slate-500">
                See all your Teams meetings for today in one convenient place
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 mb-4">
                <Video className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Quick Join</h3>
              <p className="text-sm text-slate-500">
                Join your Teams meetings with a single click directly from the app
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 mb-4">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Secure Access</h3>
              <p className="text-sm text-slate-500">
                OAuth 2.0 authentication ensures your data stays safe and secure
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">Microsoft Teams Meetings</h1>
            <p className="mt-2 text-gray-600">
              Your calendar is synced. View today's meetings below.
            </p>
          </div>
          <button
            onClick={disconnectTeams}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Disconnect Teams
          </button>
        </div>

        {/* Connected Status Banner */}
        <div className="rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Check className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-emerald-800">Connected to Microsoft Teams</p>
              <p className="text-sm text-emerald-600">
                Your calendar is synced. Meetings below are from your Teams calendar.
              </p>
            </div>
          </div>
        </div>

        {/* Meetings list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-500">Loading your meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
            <Calendar className="h-16 w-16 text-slate-300" />
            <p className="mt-4 text-lg font-medium text-slate-600">No meetings for today</p>
            <p className="mt-1 text-sm text-slate-400">You have no Teams meetings scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{meetings.length} meeting{meetings.length !== 1 ? 's' : ''} today</p>
            {meetings.map((meeting, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-800">
                      {meeting.subject || 'Untitled meeting'}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {formatTime(meeting.start)} – {formatTime(meeting.end)} ({meeting.duration} min)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-slate-400" />
                        {meeting.attendee_count} attendees
                      </span>
                      {meeting.is_online && (
                        <span className="flex items-center gap-1.5 text-blue-600">
                          <Video className="h-4 w-4" />
                          Online meeting
                        </span>
                      )}
                      {meeting.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {meeting.online_meeting_url && (
                    <a
                      href={meeting.online_meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
                    >
                      <Video className="h-4 w-4" />
                      Join in Teams
                    </a>
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
