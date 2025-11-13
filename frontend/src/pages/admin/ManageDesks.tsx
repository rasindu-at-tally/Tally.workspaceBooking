import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useDesks, useCreateDesk, useUpdateDesk, useDeleteDesk } from '@/hooks/useDesks';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Desk, CreateDeskRequest } from '@/types';

export function ManageDesks() {
  const { data: desks = [], isLoading } = useDesks();
  const createDesk = useCreateDesk();
  const updateDesk = useUpdateDesk();
  const deleteDesk = useDeleteDesk();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [formData, setFormData] = useState<CreateDeskRequest>({
    name: '',
    location: '',
    position_x: 1,
    position_y: 0,
    desk_type: '6-seater',
    description: '',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDesk) {
        await updateDesk.mutateAsync({ id: editingDesk.id, data: formData });
      } else {
        await createDesk.mutateAsync(formData);
      }
      handleCloseForm();
    } catch (error) {
      alert('Failed to save desk');
    }
  };

  const handleEdit = (desk: Desk) => {
    setEditingDesk(desk);
    setFormData({
      name: desk.name,
      location: desk.location,
      position_x: desk.position_x,
      position_y: desk.position_y,
      desk_type: desk.desk_type,
      description: desk.description || '',
      is_active: desk.is_active,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this desk?')) return;
    try {
      await deleteDesk.mutateAsync(id);
    } catch (error) {
      alert('Failed to delete desk');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDesk(null);
    setFormData({
      name: '',
      location: '',
      position_x: 1,
      position_y: 0,
      desk_type: '6-seater',
      description: '',
      is_active: true,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Desks</h1>
            <p className="mt-2 text-gray-600">Create, edit, and manage office desks</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add Desk
          </button>
        </div>

        {/* Desk Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold">
                {editingDesk ? 'Edit Desk' : 'Add Desk'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position X</label>
                    <input
                      type="number"
                      value={formData.position_x}
                      onChange={(e) =>
                        setFormData({ ...formData, position_x: parseInt(e.target.value) })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="1"
                      max="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position Y</label>
                    <input
                      type="number"
                      value={formData.position_y}
                      onChange={(e) =>
                        setFormData({ ...formData, position_y: parseInt(e.target.value) })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Desk Type</label>
                  <select
                    value={formData.desk_type}
                    onChange={(e) => setFormData({ ...formData, desk_type: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="6-seater">6-seater</option>
                    <option value="4-seater">4-seater</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {editingDesk ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Desks Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {desks.map((desk) => (
                  <tr key={desk.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {desk.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {desk.location}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {desk.desk_type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      ({desk.position_x}, {desk.position_y})
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          desk.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {desk.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(desk)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(desk.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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



