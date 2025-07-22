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

  useEffect(() => {
    if (role === 'lecturer') {
      fetchLecturerSessions();
    }
    // eslint-disable-next-line
  }, [role]);

  async function fetchLecturerSessions() {
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
      setLoadingSessions(false);
      return;
    }
    // Fetch session details
    const { data: sessionData, error: sError } = await supabase
      .from('sessions')
      .select('*')
      .in('id', sessionIds)
      .order('start_date', { ascending: false });
    if (sError || !sessionData) {
      setFetchError('Could not fetch session details');
      setSessions([]);
    } else {
      setSessions(sessionData);
    }
    setLoadingSessions(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'lecturer') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;

  return (
    <DashboardLayout role="lecturer">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">My Sessions</h2>
      <div className="bg-white rounded shadow p-4">
        {loadingSessions ? (
          <div className="text-center py-8 text-gray-500">Loading sessions...</div>
        ) : fetchError ? (
          <div className="text-center py-8 text-red-500">{fetchError}</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No sessions assigned.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 border">Name</th>
                  <th className="py-2 px-3 border">Start Date</th>
                  <th className="py-2 px-3 border">End Date</th>
                  <th className="py-2 px-3 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td className="py-2 px-3 border font-medium">{session.name}</td>
                    <td className="py-2 px-3 border">{session.start_date ? new Date(session.start_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border">{session.end_date ? new Date(session.end_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border">{session.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 