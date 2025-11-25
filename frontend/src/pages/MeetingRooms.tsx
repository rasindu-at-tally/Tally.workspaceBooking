import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MeetingRoom, MeetingRoomFilter } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function MeetingRooms() {
  const [filters, setFilters] = useState<MeetingRoomFilter>({
    is_active: true,
  });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['meeting-rooms', filters],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.floor) params.append('floor', filters.floor);
      if (filters.min_capacity) params.append('min_capacity', filters.min_capacity.toString());
      if (filters.has_projector !== undefined) params.append('has_projector', filters.has_projector.toString());
      if (filters.has_video_conf !== undefined) params.append('has_video_conf', filters.has_video_conf.toString());
      if (filters.has_whiteboard !== undefined) params.append('has_whiteboard', filters.has_whiteboard.toString());
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      
      const { data } = await axios.get<MeetingRoom[]>(
        `${API_URL}/api/meeting-rooms?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  const { data: floors = [] } = useQuery({
    queryKey: ['meeting-room-floors'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<string[]>(
        `${API_URL}/api/meeting-rooms/floors`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meeting Rooms</h1>
          <p className="mt-2 text-gray-600">Browse and book meeting rooms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor
            </label>
            <select
              value={filters.floor || ''}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Capacity
            </label>
            <input
              type="number"
              min="1"
              value={filters.min_capacity || ''}
              onChange={(e) => setFilters({ ...filters, min_capacity: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any capacity"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.has_projector || false}
                  onChange={(e) => setFilters({ ...filters, has_projector: e.target.checked ? true : undefined })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Projector</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.has_video_conf || false}
                  onChange={(e) => setFilters({ ...filters, has_video_conf: e.target.checked ? true : undefined })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Video Conference</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.has_whiteboard || false}
                  onChange={(e) => setFilters({ ...filters, has_whiteboard: e.target.checked ? true : undefined })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Whiteboard</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Rooms Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading meeting rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500">No meeting rooms found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.room_name}</h3>
                  <p className="text-sm text-gray-500">{room.room_number}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {room.floor}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Capacity: {room.capacity} people
                </div>
                {room.description && (
                  <p className="text-sm text-gray-600">{room.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {room.has_projector && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    📽️ Projector
                  </span>
                )}
                {room.has_video_conf && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    📹 Video Conf
                  </span>
                )}
                {room.has_whiteboard && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    📝 Whiteboard
                  </span>
                )}
                {room.has_screen_share && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    🖥️ Screen Share
                  </span>
                )}
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Book Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

