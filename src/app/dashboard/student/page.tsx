"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from '../../components/DashboardLayout';
import Link from 'next/link';
import { supabase } from '../../supabaseClient';

// Types for dashboard state
type CertificateSummary = {
  id: string;
  title: string;
  created_at: string;
  status: string;
  irys_url?: string;
  session?: { id: string; name: string };
};

type RawCertificate = Omit<CertificateSummary, 'session'> & { session?: { id: string; name: string }[] | { id: string; name: string } };

export default function StudentDashboard() {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [certificates, setCertificates] = useState<CertificateSummary[]>([]);
  const [name, setName] = useState<string | null>(null);

  // Dynamically extract unique sessions from certificates
  const sessionOptions = useMemo(() => {
    const sessions = certificates
      .map(cert => cert.session)
      .filter((s): s is { id: string; name: string } => !!s && !!s.id && !!s.name)
      .map(s => ({ id: s.id, name: s.name }));
    const unique = Array.from(new Map(sessions.map(s => [s.id, s])).values());
    return [{ id: 'all', name: 'All Sessions' }, ...unique];
  }, [certificates]);

  // Fetch certificates (top 3)
  useEffect(() => {
    async function fetchCertificates() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('certificates')
          .select('id, title, created_at, status, irys_url, session:sessions(id, name)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
      const mapped = (data || []).map((cert: RawCertificate) => ({
        ...cert,
        session: Array.isArray(cert.session) ? cert.session[0] : cert.session
      }));
      setCertificates(mapped);
    }
  }
  fetchCertificates();
}, []);

  // Filter and sort certificates
  const displayedCertificates = useMemo(() => {
    let filtered = certificates;
    if (sessionFilter !== 'all') {
      filtered = filtered.filter(cert => cert.session?.id === sessionFilter);
    }
    filtered = filtered.slice().sort((a, b) => {
      const dateA = new Date(a.created_at ?? '').getTime();
      const dateB = new Date(b.created_at ?? '').getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return filtered;
  }, [certificates, sortOrder, sessionFilter]);

  function getVerificationLink(certId: string) {
    // Replace with your real public certificate URL pattern
    return `${window.location.origin}/certificates/${certId}`;
  }

  function handleCopyLink(certId: string) {
    const link = getVerificationLink(certId);
    navigator.clipboard.writeText(link);
    alert('Verification link copied!');
  }

  return (
    <DashboardLayout role="student" setName={setName}>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md text-center mx-auto mb-8">
        <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
          {name ? `Welcome, ${name}! 🎓` : 'Welcome! Please update your profile name.'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">This is your student dashboard.</p>
      </div>
      {/* My Certificates Summary */}
      <div className="mb-8 w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Certificates</h2>
          <Link href="/dashboard/student/certificates" className="text-blue-700 dark:text-blue-300 hover:underline font-medium">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certificates.length === 0 ? (
            <div className="col-span-3 text-gray-400 dark:text-gray-500">No certificates yet.</div>
          ) : (
            certificates.map(cert => (
              <div key={cert.id} className="bg-gray-50 dark:bg-gray-800 rounded p-4 shadow flex flex-col items-center">
                <div className="font-bold text-blue-800 dark:text-blue-200 mb-1">{cert.title || 'Certificate'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : ''}</div>
                <div className="text-sm mb-2 text-gray-900 dark:text-gray-100">Status: <span className="font-medium text-blue-700 dark:text-blue-300">{cert.status || 'Active'}</span></div>
                {/* Verification/Share Widget */}
                <button
                  className="text-xs px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition font-medium"
                  onClick={() => handleCopyLink(cert.id)}
                >
                  Copy Verification Link
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Upcoming Sessions */}
      <div className="mb-8 w-full max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Upcoming Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Placeholder for upcoming sessions */}
          <div className="col-span-3 text-gray-400 dark:text-gray-500">Upcoming sessions will be displayed here.</div>
        </div>
      </div>
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200">Student Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome, student! 🎓</p>
          </div>
          {/* LogoutButton will go here */}
        </div>
        {/* Sort & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div>
            <label className="mr-2 font-medium text-sm text-gray-700 dark:text-gray-200">Sort:</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div>
            <label className="mr-2 font-medium text-sm text-gray-700 dark:text-gray-200">Session:</label>
            <select
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {sessionOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        {displayedCertificates.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 dark:text-gray-500">No certificates found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayedCertificates.map(cert => (
              <div key={cert.id} className="bg-gray-50 dark:bg-gray-800 rounded p-4 shadow flex flex-col items-center">
                <div className="font-bold text-blue-800 dark:text-blue-200 mb-1">{cert.title || 'Certificate'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : ''}</div>
                <div className="text-sm mb-2 text-gray-900 dark:text-gray-100">Status: <span className="font-medium text-blue-700 dark:text-blue-300">{cert.status || 'Active'}</span></div>
                {/* Verification/Share Widget */}
                <button
                  className="text-xs px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition font-medium"
                  onClick={() => handleCopyLink(cert.id)}
                >
                  Copy Verification Link
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 