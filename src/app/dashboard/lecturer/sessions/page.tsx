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

export default function LecturerSessionsPage() {
  const { role, loading, error } = useUserRole();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [fetchError, setFetchError] = useState('');
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (role === 'lecturer') {
      fetchLecturerSessions(page);
    }
  }, [role, page]);

  async function fetchLecturerSessions(pageNum: number) {
    setLoadingSessions(true);
    setFetchError('');
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setFetchError('Not authenticated');
      setLoadingSessions(false);
      return;
    }
    // Get session IDs from lecturer_sessions
    const { data: lecturerSessions, error: lsError } = await supabase
      .from('lecturer_sessions')
      .select('session_id')
      .eq('user_id', user.id);
    if (lsError || !lecturerSessions) {
      setFetchError('Could not fetch assigned sessions');
      setLoadingSessions(false);
      return;
    }
    const sessionIds = lecturerSessions.map((ls: { session_id: string }) => ls.session_id);
    if (sessionIds.length === 0) {
      setSessions([]);
      setTotalCount(0);
      setLoadingSessions(false);
      return;
    }
    // Fetch session details
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data: sessionData, error: sError, count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .in('id', sessionIds)
      .order('start_date', { ascending: false })
      .range(from, to);
    if (sError || !sessionData) {
      setFetchError('Could not fetch session details');
      setSessions([]);
      setTotalCount(0);
    } else {
      setSessions(sessionData);
      setTotalCount(count || 0);
    }
    setLoadingSessions(false);
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">Loading...</div>;
  if (error || role !== 'lecturer') return <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">Unauthorized</div>;

  return (
    <DashboardLayout role="lecturer">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6">My Sessions</h2>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        {loadingSessions ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-300">Loading sessions...</div>
        ) : fetchError ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400">{fetchError}</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">No sessions assigned.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Name</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Start Date</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">End Date</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td className="py-2 px-3 border font-medium text-gray-900 dark:text-gray-100">{session.name}</td>
                    <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{session.start_date ? new Date(session.start_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{session.end_date ? new Date(session.end_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{session.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
      </div>
    </DashboardLayout>
  );
} 