import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Layout } from '@/components/Layout';
import type { MeetingInfo, MSTeamsStatus } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/components/Toast';
import { getToken } from '@/lib/auth';

// Use relative /api paths by default so Vite proxy/production base handles the host + port,
// but allow overriding with VITE_API_URL for deployments.
const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

export default function TeamsMeetings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [useDemoMode, setUseDemoMode] = useState(false);

  // Show a success toast if redirected after connecting Teams
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('teams_connected') === 'true') {
      showToast({
        type: 'success',
        message: 'Microsoft Teams connected successfully.',
      });
      // Clean up query param from URL
      navigate('/teams', { replace: true });
    }
  }, [location.search, navigate, showToast]);

  // Check Teams connection status
  const { data: teamsStatus } = useQuery<MSTeamsStatus>({
    queryKey: ['teams-status'],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}/api/teams/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  // Load today's meetings from Teams (or demo)
  const { data: meetings = [], isLoading } = useQuery<MeetingInfo[]>({
    queryKey: ['teams-meetings-today', useDemoMode],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get<MeetingInfo[]>(
        `${API_BASE}/api/teams/meetings/today?use_demo=${useDemoMode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
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
          type: 'info',
          message: 'Microsoft Teams integration is not configured. Using demo mode.',
        });
        setUseDemoMode(true);
      } else {
        showToast({
          type: 'error',
          message: 'Failed to start Microsoft Teams connection.',
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Microsoft Teams Meetings</h1>
            <p className="mt-2 text-gray-600">
              Connect your Microsoft Teams calendar to see today&apos;s upcoming meetings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useDemoMode}
                onChange={(e) => setUseDemoMode(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Demo mode</span>
            </label>
            {!teamsStatus?.connected && !useDemoMode && (
              <button
                onClick={connectTeams}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Connect Microsoft Teams
              </button>
            )}
          </div>
        </div>

        {/* Status banner */}
        {teamsStatus && (
          <div
            className={`rounded-lg p-4 ${
              teamsStatus.connected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {teamsStatus.connected ? '✅' : '⚠️'}
              </span>
              <div>
                <p
                  className={`font-medium ${
                    teamsStatus.connected ? 'text-green-800' : 'text-yellow-800'
                  }`}
                >
                  {teamsStatus.connected ? 'Connected to Microsoft Teams' : 'Not connected to Microsoft Teams'}
                </p>
                <p
                  className={`text-sm ${
                    teamsStatus.connected ? 'text-green-700' : 'text-yellow-700'
                  }`}
                >
                  {teamsStatus.connected
                    ? 'Your calendar is synced. Meetings below are from your Teams calendar.'
                    : 'Turn on demo mode or connect Microsoft Teams to view meetings.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meetings list */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="text-lg text-gray-600">Loading your meetings...</div>
          </div>
        ) : meetings.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow-sm">
            <p className="text-gray-600">
              No meetings found for today{useDemoMode ? ' (using demo data).' : '.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting, idx) => (
              <div
                key={idx}
                className="rounded-lg border bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {meeting.subject || 'Untitled meeting'}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>
                      🕒 {formatTime(meeting.start)} – {formatTime(meeting.end)} ({meeting.duration} min)
                    </span>
                    <span>👥 {meeting.attendee_count} attendees</span>
                    {meeting.is_online && (
                      <span className="text-blue-600">📹 Online meeting</span>
                    )}
                    {meeting.location && (
                      <span>📍 {meeting.location}</span>
                    )}
                  </div>
                </div>
                {meeting.online_meeting_url && (
                  <a
                    href={meeting.online_meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Join in Teams
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}


