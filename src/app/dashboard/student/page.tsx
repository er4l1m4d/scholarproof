"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from '../../components/DashboardLayout';
import CertificateCard from '../../components/CertificateCard';
import { getStudentCertificates } from '@/utils/getStudentCertificates';
import { supabase } from '../../supabaseClient';

type Certificate = {
  id: string;
  title?: string;
  created_at?: string;
  irys_url?: string;
  revoked?: boolean;
  sessions?: { id?: string; name?: string };
};

export default function StudentDashboard() {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // Dynamically extract unique sessions from certificates
  const sessionOptions = useMemo(() => {
    const sessions = certificates
      .map(cert => cert.sessions)
      .filter((s): s is { id: string; name: string } => !!s && !!s.id && !!s.name)
      .map(s => ({ id: s.id, name: s.name }));
    const unique = Array.from(new Map(sessions.map(s => [s.id, s])).values());
    return [{ id: 'all', name: 'All Sessions' }, ...unique];
  }, [certificates]);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with real student ID from auth/session
        const studentId = 'demo-student-id';
        const data = await getStudentCertificates(studentId);
        setCertificates(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch certificates');
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);

  useEffect(() => {
    async function fetchName() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single();
        setName(data?.name || null);
      }
    }
    fetchName();
  }, []);

  // Filter and sort certificates
  const displayedCertificates = useMemo(() => {
    let filtered = certificates;
    if (sessionFilter !== 'all') {
      filtered = filtered.filter(cert => cert.sessions?.id === sessionFilter);
    }
    filtered = filtered.slice().sort((a, b) => {
      const dateA = new Date(a.created_at ?? '').getTime();
      const dateB = new Date(b.created_at ?? '').getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return filtered;
  }, [certificates, sortOrder, sessionFilter]);

  return (
    <DashboardLayout role="student">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md text-center mx-auto mb-8">
        <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
          Welcome, {name || 'student'}! 🎓
        </h1>
        <p className="text-gray-600 dark:text-gray-300">This is your student dashboard.</p>
      </div>
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Student Dashboard</h1>
            <p className="text-gray-600">Welcome, student! 🎓</p>
          </div>
          {/* LogoutButton will go here */}
        </div>
        {/* Sort & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div>
            <label className="mr-2 font-medium text-sm text-gray-700">Sort:</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div>
            <label className="mr-2 font-medium text-sm text-gray-700">Session:</label>
            <select
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {sessionOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        {loading && <div className="text-center text-gray-500">Loading certificates...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedCertificates.length === 0 ? (
              <div className="col-span-full text-center text-gray-400">No certificates found.</div>
            ) : (
              displayedCertificates.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} />
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 