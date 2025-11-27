import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MeetingRoom, CreateMeetingRoomRequest, UpdateMeetingRoomRequest } from '../../types';
import { Layout } from '@/components/Layout';

const API_URL =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  'http://localhost:8000';

export default function ManageMeetingRooms() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['admin-meeting-rooms'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<MeetingRoom[]>(
        `${API_URL}/api/meeting-rooms?is_active=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (roomData: CreateMeetingRoomRequest) => {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/meeting-rooms`, roomData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-rooms'] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMeetingRoomRequest }) => {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/meeting-rooms/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-rooms'] });
      setEditingRoom(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/meeting-rooms/${id}?soft_delete=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-rooms'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      room_name: formData.get('room_name') as string,
      room_number: formData.get('room_number') as string,
      location: formData.get('location') as string,
      capacity: parseInt(formData.get('capacity') as string),
      has_projector: formData.get('has_projector') === 'on',
      has_video_conf: formData.get('has_video_conf') === 'on',
      has_whiteboard: formData.get('has_whiteboard') === 'on',
      has_screen_share: formData.get('has_screen_share') === 'on',
      description: formData.get('description') as string || undefined,
    };

    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">Manage Meeting Rooms</h1>
            <p className="mt-2 text-gray-600">Add, edit, or remove meeting rooms</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Meeting Room
          </button>
        </div>

      {/* Create/Edit Form */}
      {(isCreating || editingRoom) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRoom ? 'Edit Meeting Room' : 'Create Meeting Room'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="room_name"
                  defaultValue={editingRoom?.room_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  name="room_number"
                  defaultValue={editingRoom?.room_number}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingRoom?.location}
                  required
                  placeholder="e.g., Melbourne, Sydney"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={editingRoom?.capacity}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={editingRoom?.description}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_projector"
                    defaultChecked={editingRoom?.has_projector}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Projector</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_video_conf"
                    defaultChecked={editingRoom?.has_video_conf}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Video Conference</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_whiteboard"
                    defaultChecked={editingRoom?.has_whiteboard}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Whiteboard</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_screen_share"
                    defaultChecked={editingRoom?.has_screen_share}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Screen Share</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingRoom(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingRoom
                  ? 'Update Room'
                  : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Room Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amenities
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{room.room_name}</div>
                    <div className="text-sm text-gray-500">{room.room_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.capacity} people
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {room.has_projector && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">📽️</span>}
                      {room.has_video_conf && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">📹</span>}
                      {room.has_whiteboard && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">📝</span>}
                      {room.has_screen_share && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🖥️</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingRoom(room)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to deactivate this room?')) {
                          deleteMutation.mutate(room.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </Layout>
  );
}

