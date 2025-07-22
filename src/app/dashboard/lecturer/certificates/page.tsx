"use client";
import DashboardLayout from '../../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

interface Certificate {
  id: string;
  title?: string;
  created_at?: string;
  status?: string;
  student?: { id: string; name: string };
  session?: { id: string; name: string };
}

export default function LecturerCertificatesPage() {
  const { role, loading, error } = useUserRole();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [fetchError, setFetchError] = useState('');
  // Filter state (placeholders for now)
  const [studentFilter, setStudentFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (role === 'lecturer') {
      fetchLecturerCertificates();
    }
    // eslint-disable-next-line
  }, [role]);

  async function fetchLecturerCertificates() {
    setLoadingCerts(true);
    setFetchError('');
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setFetchError('Not authenticated');
      setLoadingCerts(false);
      return;
    }
    // Get session IDs from lecturer_sessions
    const { data: lecturerSessions, error: lsError } = await supabase
      .from('lecturer_sessions')
      .select('session_id')
      .eq('user_id', user.id);
    if (lsError || !lecturerSessions) {
      setFetchError('Could not fetch assigned sessions');
      setLoadingCerts(false);
      return;
    }
    const sessionIds = lecturerSessions.map((ls: { session_id: string }) => ls.session_id);
    if (sessionIds.length === 0) {
      setCertificates([]);
      setLoadingCerts(false);
      return;
    }
    // Fetch certificates for these sessions
    const { data, error: certError } = await supabase
      .from('certificates')
      .select('id, title, created_at, status, students(id, name), sessions(id, name)')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });
    if (certError || !data) {
      setFetchError('Could not fetch certificates');
      setCertificates([]);
    } else {
      setCertificates(
        data.map((cert: any) => ({
          ...cert,
          student: cert.students && cert.students.length > 0 ? cert.students[0] : undefined,
          session: cert.sessions && cert.sessions.length > 0 ? cert.sessions[0] : undefined,
        }))
      );
    }
    setLoadingCerts(false);
  }

  // Filter logic (simple client-side for now)
  const filteredCertificates = certificates.filter(cert => {
    return (
      (!studentFilter || cert.student?.name?.toLowerCase().includes(studentFilter.toLowerCase())) &&
      (!sessionFilter || cert.session?.name?.toLowerCase().includes(sessionFilter.toLowerCase())) &&
      (!statusFilter || (cert.status || '').toLowerCase().includes(statusFilter.toLowerCase()))
    );
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'lecturer') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;

  return (
    <DashboardLayout role="lecturer">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">My Certificates</h2>
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="flex flex-wrap gap-4 mb-2">
          <input
            type="text"
            placeholder="Filter by student name"
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={studentFilter}
            onChange={e => setStudentFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by session"
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={sessionFilter}
            onChange={e => setSessionFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by status"
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">
        {loadingCerts ? (
          <div className="text-center py-8 text-gray-500">Loading certificates...</div>
        ) : fetchError ? (
          <div className="text-center py-8 text-red-500">{fetchError}</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No certificates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 border">Title</th>
                  <th className="py-2 px-3 border">Student</th>
                  <th className="py-2 px-3 border">Session</th>
                  <th className="py-2 px-3 border">Date Issued</th>
                  <th className="py-2 px-3 border">Status</th>
                  <th className="py-2 px-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map(cert => (
                  <tr key={cert.id}>
                    <td className="py-2 px-3 border font-medium">{cert.title || '-'}</td>
                    <td className="py-2 px-3 border">{cert.student?.name || '-'}</td>
                    <td className="py-2 px-3 border">{cert.session?.name || '-'}</td>
                    <td className="py-2 px-3 border">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-3 border">{cert.status || '-'}</td>
                    <td className="py-2 px-3 border">
                      <button className="text-blue-700 hover:underline mr-2" onClick={() => alert('Edit coming soon!')}>Edit</button>
                      <button className="text-yellow-700 hover:underline mr-2" onClick={() => alert('Regenerate coming soon!')}>Regenerate</button>
                      <button className="text-red-600 hover:underline" onClick={() => alert('Revoke coming soon!')}>Revoke</button>
                    </td>
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