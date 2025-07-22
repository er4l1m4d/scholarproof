"use client";
import DashboardLayout from '../../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

interface Session {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

const statusOptions = ['Active', 'Inactive', 'Upcoming', 'Completed'];

export default function AdminSessionsPage() {
  const { role, loading, error } = useUserRole();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', status: 'Active' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      fetchSessions(page);
    }
    // eslint-disable-next-line
  }, [role, page]);

  async function fetchSessions(pageNum: number) {
    setLoadingSessions(true);
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: false })
      .range(from, to);
    if (!error && data) {
      setSessions(data);
      setTotalCount(count || 0);
    } else {
      setSessions([]);
      setTotalCount(0);
    }
    setLoadingSessions(false);
  }

  function openCreateModal() {
    setEditId(null);
    setForm({ name: '', start_date: '', end_date: '', status: 'Active' });
    setShowModal(true);
    setFormError('');
  }

  function openEditModal(session: Session) {
    setEditId(session.id);
    setForm({
      name: session.name || '',
      start_date: session.start_date ? session.start_date.slice(0, 10) : '',
      end_date: session.end_date ? session.end_date.slice(0, 10) : '',
      status: session.status || 'Active',
    });
    setShowModal(true);
    setFormError('');
  }

  async function handleCreateOrEditSession(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    if (!form.name || !form.start_date || !form.end_date) {
      setFormError('All fields are required.');
      setFormLoading(false);
      return;
    }
    if (editId) {
      // Edit
      const { error } = await supabase.from('sessions').update({
        name: form.name,
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
      }).eq('id', editId);
      if (error) {
        setFormError(error.message);
      } else {
        setShowModal(false);
        setEditId(null);
        setForm({ name: '', start_date: '', end_date: '', status: 'Active' });
        fetchSessions(page); // Re-fetch current page after edit
      }
    } else {
      // Create
      const { error } = await supabase.from('sessions').insert({
        name: form.name,
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
      });
      if (error) {
        setFormError(error.message);
      } else {
        setShowModal(false);
        setForm({ name: '', start_date: '', end_date: '', status: 'Active' });
        fetchSessions(page); // Re-fetch current page after create
      }
    }
    setFormLoading(false);
  }

  function openDeleteDialog(id: string) {
    setDeleteId(id);
    setDeleteError('');
  }

  async function handleDeleteSession() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError('');
    const { error } = await supabase.from('sessions').delete().eq('id', deleteId);
    if (error) {
      setDeleteError(error.message);
    } else {
      setDeleteId(null);
      fetchSessions(page); // Re-fetch current page after delete
    }
    setDeleteLoading(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;

  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Sessions</h2>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition font-medium"
          onClick={openCreateModal}
        >
          + Create Session
        </button>
      </div>
      {/* Modal (Create/Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => { setShowModal(false); setEditId(null); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-800">{editId ? 'Edit Session' : 'Create Session'}</h3>
            <form onSubmit={handleCreateOrEditSession} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Session Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition font-medium"
                disabled={formLoading}
              >
                {formLoading ? (editId ? 'Saving...' : 'Creating...') : (editId ? 'Save Changes' : 'Create Session')}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h3 className="text-lg font-bold mb-4 text-red-700">Delete Session</h3>
            <p className="mb-4">Are you sure you want to delete this session? This action cannot be undone.</p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium"
                onClick={handleDeleteSession}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded shadow p-4">
        {loadingSessions ? (
          <div className="text-center py-8 text-gray-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No sessions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 border">Name</th>
                  <th className="py-2 px-3 border">Start Date</th>
                  <th className="py-2 px-3 border">End Date</th>
                  <th className="py-2 px-3 border">Status</th>
                  <th className="py-2 px-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td className="py-2 px-3 border font-medium">{session.name}</td>
                    <td className="py-2 px-3 border">{session.start_date ? new Date(session.start_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border">{session.end_date ? new Date(session.end_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border">{session.status || '-'}</td>
                    <td className="py-2 px-3 border">
                      <button className="text-blue-700 hover:underline mr-2" onClick={() => openEditModal(session)}>Edit</button>
                      <button className="text-red-600 hover:underline" onClick={() => openDeleteDialog(session.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </DashboardLayout>
  );
} 