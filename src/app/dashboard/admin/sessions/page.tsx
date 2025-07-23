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

interface LecturerOption { id: string; name: string; email?: string; }

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
  const [assignSessionId, setAssignSessionId] = useState<string | null>(null);
  const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
  const [assignedLecturers, setAssignedLecturers] = useState<string[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      fetchSessions(page);
    }
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
    // Deletion protection: check for certificates linked to this session
    const { count, error: certCountError } = await supabase
      .from('certificates')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', deleteId);
    if (certCountError) {
      setDeleteError(certCountError.message);
      setDeleteLoading(false);
      return;
    }
    if ((count || 0) > 0) {
      setDeleteError('Cannot delete session: certificates are linked to this session.');
      setDeleteLoading(false);
      return;
    }
    // Proceed with deletion if no certificates are linked
    const { error } = await supabase.from('sessions').delete().eq('id', deleteId);
    if (error) {
      setDeleteError(error.message);
    } else {
      setDeleteId(null);
      fetchSessions(page); // Re-fetch current page after delete
    }
    setDeleteLoading(false);
  }

  async function openAssignLecturersModal(sessionId: string) {
    setAssignSessionId(sessionId);
    setAssignError('');
    setAssignLoading(true);
    // Fetch all lecturers
    const { data: allLecturers } = await supabase.from('users').select('id, name, email').eq('role', 'lecturer').order('name');
    setLecturers(allLecturers || []);
    // Fetch assigned lecturers for this session
    const { data: assigned } = await supabase.from('lecturer_sessions').select('user_id').eq('session_id', sessionId);
    setAssignedLecturers((assigned || []).map((l: { user_id: string }) => l.user_id));
    setAssignLoading(false);
  }

  function closeAssignLecturersModal() {
    setAssignSessionId(null);
    setLecturers([]);
    setAssignedLecturers([]);
    setAssignError('');
  }

  async function handleAssignLecturersSave() {
    if (!assignSessionId) return;
    setAssignLoading(true);
    setAssignError('');
    // Fetch current assignments
    const { data: current } = await supabase.from('lecturer_sessions').select('user_id').eq('session_id', assignSessionId);
    const currentIds = (current || []).map((l: { user_id: string }) => l.user_id);
    // Calculate adds and removes
    const toAdd = assignedLecturers.filter(id => !currentIds.includes(id));
    const toRemove = currentIds.filter(id => !assignedLecturers.includes(id));
    // Add new assignments
    if (toAdd.length > 0) {
      const inserts = toAdd.map(user_id => ({ user_id, session_id: assignSessionId }));
      const { error } = await supabase.from('lecturer_sessions').insert(inserts);
      if (error) setAssignError(error.message);
    }
    // Remove unassigned
    if (toRemove.length > 0) {
      const { error } = await supabase.from('lecturer_sessions').delete().eq('session_id', assignSessionId).in('user_id', toRemove);
      if (error) setAssignError(error.message);
    }
    setAssignLoading(false);
    closeAssignLecturersModal();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">Unauthorized</div>;

  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">Sessions</h2>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold"
              onClick={() => { setShowModal(false); setEditId(null); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-200">{editId ? 'Edit Session' : 'Create Session'}</h3>
            <form onSubmit={handleCreateOrEditSession} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Session Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-600 dark:text-red-400 text-sm">{formError}</div>}
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h3 className="text-lg font-bold mb-4 text-red-700 dark:text-red-400">Delete Session</h3>
            <p className="mb-4 text-gray-900 dark:text-gray-100">Are you sure you want to delete this session? This action cannot be undone.</p>
            {deleteError && <div className="text-red-600 dark:text-red-400 text-sm mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium"
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
      {assignSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold" onClick={closeAssignLecturersModal} aria-label="Close">&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-200">Assign Lecturers</h3>
            {assignLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-300">Loading...</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); handleAssignLecturersSave(); }} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Lecturers</label>
                  <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-800">
                    {lecturers.length === 0 ? (
                      <div className="text-gray-400 dark:text-gray-500">No lecturers found.</div>
                    ) : (
                      lecturers.map(l => (
                        <label key={l.id} className="flex items-center gap-2 py-1 text-gray-900 dark:text-gray-100">
                          <input
                            type="checkbox"
                            checked={assignedLecturers.includes(l.id)}
                            onChange={e => {
                              if (e.target.checked) setAssignedLecturers(ids => [...ids, l.id]);
                              else setAssignedLecturers(ids => ids.filter(id => id !== l.id));
                            }}
                          />
                          <span>{l.name || l.email}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                {assignError && <div className="text-red-600 dark:text-red-400 text-sm">{assignError}</div>}
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium" onClick={closeAssignLecturersModal} disabled={assignLoading}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white font-medium" disabled={assignLoading}>{assignLoading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        {loadingSessions ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-300">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">No sessions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Name</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Start Date</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">End Date</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Status</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td className="py-2 px-3 border font-medium text-gray-900 dark:text-gray-100">{session.name}</td>
                    <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{session.start_date ? new Date(session.start_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{session.end_date ? new Date(session.end_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{session.status || '-'}</td>
                    <td className="py-2 px-3 border">
                      <button className="text-blue-700 dark:text-blue-300 hover:underline mr-2" onClick={() => openEditModal(session)}>Edit</button>
                      <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => openDeleteDialog(session.id)}>Delete</button>
                      <button className="text-green-700 dark:text-green-300 hover:underline ml-2" onClick={() => openAssignLecturersModal(session.id)}>Assign Lecturers</button>
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
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-900 dark:text-gray-100">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium"
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