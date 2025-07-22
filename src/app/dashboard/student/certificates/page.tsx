"use client";
import { useEffect, useState } from "react";
import DashboardLayout from '../../../components/DashboardLayout';
import { supabase } from '../../../supabaseClient';

interface Certificate {
  id: string;
  title: string;
  created_at: string;
  status: string;
  irys_url?: string;
  session?: { id: string; name: string };
}

type RawCertificate = Omit<Certificate, 'session'> & { session?: { id: string; name: string }[] | { id: string; name: string } };

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [collapsed, setCollapsed] = useState<{ [sessionId: string]: boolean }>({});
  const pageSize = 9;

  useEffect(() => {
    async function fetchCertificates() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('certificates')
        .select('id, title, created_at, status, irys_url, session:sessions(id, name)', { count: 'exact' })
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) {
        setError(error.message);
        setCertificates([]);
        setTotalCount(0);
      } else {
        const mapped = (data || []).map((cert: RawCertificate) => ({
          ...cert,
          session: Array.isArray(cert.session) ? cert.session[0] : cert.session
        }));
        setCertificates(mapped);
        setTotalCount(count || 0);
        // Set all sessions expanded by default
        const sessionIds = Array.from(new Set(mapped.map(c => c.session?.id || 'no-session')));
        setCollapsed(Object.fromEntries(sessionIds.map(id => [id, false])));
      }
      setLoading(false);
    }
    fetchCertificates();
  }, [page]);

  function getVerificationLink(certId: string) {
    return `${window.location.origin}/certificates/${certId}`;
  }

  function handleCopyLink(certId: string) {
    const link = getVerificationLink(certId);
    navigator.clipboard.writeText(link);
    alert('Verification link copied!');
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Group certificates by session
  const grouped = certificates.reduce((acc, cert) => {
    const sessionId = cert.session?.id || 'no-session';
    const sessionName = cert.session?.name || 'No Session';
    if (!acc[sessionId]) acc[sessionId] = { name: sessionName, certs: [] };
    acc[sessionId].certs.push(cert);
    return acc;
  }, {} as Record<string, { name: string; certs: Certificate[] }>);

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6 text-center">My Certificates</h1>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <span className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        ) : certificates.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-300">No certificates found.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([sessionId, group]) => (
              <div key={sessionId} className="border rounded-lg shadow bg-white dark:bg-gray-800">
                <button
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-t-lg focus:outline-none"
                  onClick={() => setCollapsed(c => ({ ...c, [sessionId]: !c[sessionId] }))}
                >
                  <span className="font-semibold text-blue-700 dark:text-blue-300 text-lg">{group.name}</span>
                  <span className="text-xs text-gray-500">{collapsed[sessionId] ? 'Show' : 'Hide'} ({group.certs.length})</span>
                </button>
                {!collapsed[sessionId] && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    {group.certs.map(cert => (
                      <div key={cert.id} className="bg-white dark:bg-gray-800 rounded p-4 shadow flex flex-col items-center">
                        <div className="font-bold text-blue-800 dark:text-blue-200 mb-1">{cert.title || 'Certificate'}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : ''}</div>
                        {cert.session && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Session: <span className="font-semibold text-gray-900 dark:text-gray-100">{cert.session.name}</span></div>
                        )}
                        <div className="text-sm mb-2 text-gray-900 dark:text-gray-100">Status: <span className="font-medium text-blue-700 dark:text-blue-300">{cert.status || 'Active'}</span></div>
                        <button
                          className="text-xs px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition font-medium mb-2"
                          onClick={() => handleCopyLink(cert.id)}
                        >
                          Copy Verification Link
                        </button>
                        {cert.irys_url && (
                          <a
                            href={cert.irys_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-700 dark:text-blue-300 hover:underline mt-1"
                          >
                            View on Irys
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
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