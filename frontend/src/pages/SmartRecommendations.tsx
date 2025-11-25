import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MeetingWithRecommendations, CreateRoomBookingRequest, MSTeamsStatus } from '../types';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SmartRecommendations() {
  const queryClient = useQueryClient();
  const [useDemoMode, setUseDemoMode] = useState(true);

  // Check Teams connection status
  const { data: teamsStatus } = useQuery<MSTeamsStatus>({
    queryKey: ['teams-status'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/teams/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  // Get meeting recommendations
  const { data: meetingsData = [], isLoading } = useQuery({
    queryKey: ['meeting-recommendations', useDemoMode],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<MeetingWithRecommendations[]>(
        `${API_URL}/api/teams/meetings/recommendations?use_demo=${useDemoMode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  const bookRoomMutation = useMutation({
    mutationFn: async ({ roomId, meeting }: { roomId: string; meeting: any }) => {
      const token = localStorage.getItem('token');
      const bookingData: CreateRoomBookingRequest = {
        room_id: roomId,
        start_time: meeting.start,
        end_time: meeting.end,
        meeting_subject: meeting.subject,
        attendee_count: meeting.attendee_count,
      };
      await axios.post(
        `${API_URL}/api/room-bookings`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      alert('Room booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-room-bookings'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Failed to book room');
    },
  });

  const connectTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/teams/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = data.auth_url;
    } catch (error: any) {
      if (error.response?.status === 503) {
        alert('MS Teams integration is not configured. Using demo mode.');
        setUseDemoMode(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 Smart Room Recommendations</h1>
          <p className="mt-2 text-gray-600">AI-powered meeting room suggestions based on your calendar</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useDemoMode}
              onChange={(e) => setUseDemoMode(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Demo Mode</span>
          </label>
          {!teamsStatus?.connected && !useDemoMode && (
            <button
              onClick={connectTeams}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Connect MS Teams
            </button>
          )}
        </div>
      </div>

      {/* Teams Status Banner */}
      {teamsStatus && (
        <div className={`p-4 rounded-lg ${teamsStatus.connected ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {teamsStatus.connected ? '✅' : '⚠️'}
            </span>
            <div>
              <p className={`font-medium ${teamsStatus.connected ? 'text-green-800' : 'text-yellow-800'}`}>
                {teamsStatus.connected ? 'Connected to Microsoft Teams' : 'Not Connected'}
              </p>
              <p className={`text-sm ${teamsStatus.connected ? 'text-green-700' : 'text-yellow-700'}`}>
                {teamsStatus.connected
                  ? 'Your calendar is synced and recommendations are personalized'
                  : 'Using demo data. Connect MS Teams for personalized recommendations.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Analyzing your meetings...</p>
        </div>
      ) : meetingsData.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500">No meetings found for today that need rooms.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {meetingsData.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
              {/* Meeting Info */}
              <div className="border-b pb-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{item.meeting.subject}</h2>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        🕐 {formatTime(item.meeting.start)} - {formatTime(item.meeting.end)}
                      </span>
                      <span className="flex items-center">
                        👥 {item.meeting.attendee_count} attendees
                      </span>
                      <span className="flex items-center">
                        ⏱️ {item.meeting.duration} min
                      </span>
                      {item.meeting.is_online && (
                        <span className="flex items-center text-blue-600">
                          📹 Online Meeting
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommended Rooms
                </h3>
                {item.recommendations.length === 0 ? (
                  <p className="text-gray-500">No available rooms found for this meeting.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.recommendations.map((rec, recIdx) => (
                      <div
                        key={recIdx}
                        className="border-2 rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{rec.room.room_name}</h4>
                            <p className="text-sm text-gray-500">{rec.room.room_number}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{Math.round(rec.score)}%</div>
                            <div className="text-xs text-gray-500">Match</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {rec.room.floor} • {rec.room.capacity} seats
                          </span>
                        </div>

                        <div className="space-y-1 mb-4">
                          {rec.match_reasons.map((reason, reasonIdx) => (
                            <div key={reasonIdx} className="flex items-start text-xs text-gray-600">
                              <span className="mr-1">✓</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => bookRoomMutation.mutate({ roomId: rec.room.id, meeting: item.meeting })}
                          disabled={bookRoomMutation.isPending}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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
  );
}

