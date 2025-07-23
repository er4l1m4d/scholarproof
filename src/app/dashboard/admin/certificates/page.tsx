"use client";

import DashboardLayout from '../../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../supabaseClient';
// import toast from 'react-hot-toast';
import CertificateTemplate from '../../../components/CertificateTemplate';

interface Certificate {
  id: string;
  title?: string;
  created_at?: string;
  status?: string;
  student_id?: string;
  session_id?: string;
}

interface EditForm {
  id: string;
  title: string;
  status: string;
}

interface SessionOption { id: string; name: string; }
interface StudentOption { id: string; name: string; }

export default function AdminCertificatesPage() {
  const { role, loading, error } = useUserRole();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [fetchError, setFetchError] = useState('');
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  // Filter state (placeholders for now)
  const [studentFilter, setStudentFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editCert, setEditCert] = useState<EditForm | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState('');
  const [regenId, setRegenId] = useState<string | null>(null);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState('');
  const [showGenModal, setShowGenModal] = useState(false);
  const [sessionsList, setSessionsList] = useState<SessionOption[]>([]);
  const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
  const [genForm, setGenForm] = useState({ sessionId: '', studentId: '', title: '' });
  const [style, setStyle] = useState('Elegant');
  const [showPreview, setShowPreview] = useState(false);

  const CERT_WIDTH = 420;
  const CERT_HEIGHT = 297;

  const previewBoxRef = useRef<HTMLDivElement>(null);
  const [certScale, setCertScale] = useState(1);

  useEffect(() => {
    if (role === 'admin') {
      fetchCertificates(page);
    }
  }, [role, page]);

  useEffect(() => {
    if (role === 'admin' && showGenModal) {
      fetchSessionsList();
    }
  }, [role, showGenModal]);

  useEffect(() => {
    function updateScale() {
      const box = previewBoxRef.current;
      if (box) {
        const width = box.offsetWidth;
        const height = box.offsetHeight;
        if (width > 0 && height > 0) {
          setCertScale(Math.min(width / 420, height / 297));
        }
      }
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    let observer: ResizeObserver | undefined;
    if (previewBoxRef.current) {
      observer = new ResizeObserver(updateScale);
      observer.observe(previewBoxRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateScale);
      if (observer && previewBoxRef.current) observer.disconnect();
    };
  }, [showPreview]);

  async function fetchCertificates(pageNum: number) {
    setLoadingCerts(true);
    setFetchError('');
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('certificates')
      .select('id, title, created_at, status, student_id, session_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error || !data) {
      setFetchError('Could not fetch certificates');
      setCertificates([]);
      setTotalCount(0);
    } else {
      setCertificates(data);
      setTotalCount(count || 0);
    }
    setLoadingCerts(false);
  }

  async function fetchSessionsList() {
    const { data, error } = await supabase.from('sessions').select('id, name').order('name');
    if (!error && data) setSessionsList(data);
    else setSessionsList([]);
  }

  async function fetchStudentsList(sessionId: string) {
    // Optionally, filter students by session if you have a join table; otherwise, fetch all students
    const { data, error } = await supabase.from('users').select('id, name').eq('role', 'student').order('name');
    if (!error && data) setStudentsList(data);
    else setStudentsList([]);
  }

  // Filter logic (simple client-side for now)
  const filteredCertificates = certificates.filter(cert => {
    const studentName = studentsList.find(s => s.id === cert.student_id)?.name || '';
    const sessionName = sessionsList.find(s => s.id === cert.session_id)?.name || '';
    return (
      (!studentFilter || studentName.toLowerCase().includes(studentFilter.toLowerCase())) &&
      (!sessionFilter || sessionName.toLowerCase().includes(sessionFilter.toLowerCase())) &&
      (!statusFilter || (cert.status || '').toLowerCase().includes(statusFilter.toLowerCase()))
    );
  });

  function openEditModal(cert: Certificate) {
    setEditCert({ id: cert.id, title: cert.title || '', status: cert.status || '' });
    setEditError('');
  }

  async function handleEditCert(e: React.FormEvent) {
    e.preventDefault();
    if (!editCert) return;
    setEditLoading(true);
    setEditError('');
    const { error } = await supabase.from('certificates').update({
      title: editCert.title,
      status: editCert.status,
    }).eq('id', editCert.id);
    if (error) setEditError(error.message);
    else {
      setEditCert(null);
      fetchCertificates(page);
    }
    setEditLoading(false);
  }

  function openRevokeDialog(id: string) {
    setRevokeId(id);
    setRevokeError('');
  }

  async function handleRevokeCert() {
    if (!revokeId) return;
    setRevokeLoading(true);
    setRevokeError('');
    const { error } = await supabase.from('certificates').update({ status: 'Revoked' }).eq('id', revokeId);
    if (error) setRevokeError(error.message);
    else {
      setRevokeId(null);
      fetchCertificates(page);
    }
    setRevokeLoading(false);
  }

  function openRegenDialog(id: string) {
    setRegenId(id);
    setRegenError('');
  }

  async function handleRegenCert() {
    if (!regenId) return;
    setRegenLoading(true);
    setRegenError('');
    const { error } = await supabase.from('certificates').update({ status: 'Regenerated', regenerated_at: new Date().toISOString() }).eq('id', regenId);
    if (error) setRegenError(error.message);
    else {
      setRegenId(null);
      fetchCertificates(page);
    }
    setRegenLoading(false);
  }

  function openGenModal() {
    setShowGenModal(true);
    setGenForm({ sessionId: '', studentId: '', title: '' });
    setStudentsList([]);
  }

  async function handleGenSessionChange(sessionId: string) {
    setGenForm(f => ({ ...f, sessionId, studentId: '' }));
    await fetchStudentsList(sessionId);
  }

  function handleGenStudentChange(studentId: string) {
    setGenForm(f => ({ ...f, studentId }));
  }
  function handleGenTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setGenForm(f => ({ ...f, title: e.target.value }));
  }

  function handleGeneratePreview(e: React.FormEvent) {
    e.preventDefault();
    setShowPreview(true);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">Unauthorized</div>;

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6">Certificates</h2>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4 mb-4">
        <div className="flex flex-wrap gap-4 mb-2">
          <input
            type="text"
            placeholder="Filter by student name"
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={studentFilter}
            onChange={e => setStudentFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by session"
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={sessionFilter}
            onChange={e => setSessionFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by status"
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
      </div>
      <button
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition font-medium mb-4"
        onClick={openGenModal}
      >
        + Generate Certificate
      </button>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        {loadingCerts ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-300">Loading certificates...</div>
        ) : fetchError ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400">{fetchError}</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">No certificates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Title</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Student</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Session</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Date Issued</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Status</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map(cert => {
                  const studentName = studentsList.find(s => s.id === cert.student_id)?.name || cert.student_id || '-';
                  const sessionName = sessionsList.find(s => s.id === cert.session_id)?.name || cert.session_id || '-';
                  return (
                    <tr key={cert.id}>
                      <td className="py-2 px-3 border font-medium text-gray-900 dark:text-gray-100">{cert.title || '-'}</td>
                      <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{studentName}</td>
                      <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{sessionName}</td>
                      <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : '-'}</td>
                      <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{cert.status || '-'}</td>
                      <td className="py-2 px-3 border">
                        <button className="text-blue-700 dark:text-blue-300 hover:underline mr-2" onClick={() => openEditModal(cert)}>Edit</button>
                        <button className="text-yellow-700 dark:text-yellow-300 hover:underline mr-2" onClick={() => openRegenDialog(cert.id)}>Regenerate</button>
                        <button className="text-red-600 dark:text-red-400 hover:underline" onClick={() => openRevokeDialog(cert.id)}>Revoke</button>
                      </td>
                    </tr>
                  );
                })}
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
      {editCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold" onClick={() => setEditCert(null)} aria-label="Close">&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-200">Edit Certificate</h3>
            <form onSubmit={handleEditCert} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Title</label>
                <input type="text" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={editCert.title} onChange={e => setEditCert(c => c ? { ...c, title: e.target.value } : c)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Status</label>
                <input type="text" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={editCert.status} onChange={e => setEditCert(c => c ? { ...c, status: e.target.value } : c)} required />
              </div>
              {editError && <div className="text-red-600 dark:text-red-400 text-sm">{editError}</div>}
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition font-medium" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      )}
      {revokeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h3 className="text-lg font-bold mb-4 text-red-700 dark:text-red-400">Revoke Certificate</h3>
            <p className="mb-4 text-gray-900 dark:text-gray-100">Are you sure you want to revoke this certificate? This action cannot be undone.</p>
            {revokeError && <div className="text-red-600 dark:text-red-400 text-sm mb-2">{revokeError}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium" onClick={() => setRevokeId(null)} disabled={revokeLoading}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium" onClick={handleRevokeCert} disabled={revokeLoading}>{revokeLoading ? 'Revoking...' : 'Revoke'}</button>
            </div>
          </div>
        </div>
      )}
      {regenId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h3 className="text-lg font-bold mb-4 text-yellow-700 dark:text-yellow-300">Regenerate Certificate</h3>
            <p className="mb-4 text-gray-900 dark:text-gray-100">Are you sure you want to regenerate this certificate?</p>
            {regenError && <div className="text-red-600 dark:text-red-400 text-sm mb-2">{regenError}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium" onClick={() => setRegenId(null)} disabled={regenLoading}>Cancel</button>
              <button className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white font-medium" onClick={handleRegenCert} disabled={regenLoading}>{regenLoading ? 'Regenerating...' : 'Regenerate'}</button>
            </div>
          </div>
        </div>
      )}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-blue-700 text-white p-6">
              <h1 className="text-2xl font-bold">Generate Certificate</h1>
            </div>
            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Domain Owner</h2>
                  <div className="w-full p-3 border border-gray-300 rounded bg-gray-50 font-semibold text-gray-800">{studentsList.find(s => s.id === genForm.studentId)?.name || 'Select a student'}</div>
                  <p className="text-sm text-gray-500 mt-1">This will appear as the certificate owner</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Certificate Style</h2>
                  <select className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={style} onChange={e => setStyle(e.target.value)}>
                    <option value="Elegant">Elegant</option>
                    <option value="Modern">Modern</option>
                    <option value="Classic">Classic</option>
                  </select>
                </div>
                <form onSubmit={handleGeneratePreview} className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Session</h2>
                    <select className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={genForm.sessionId} onChange={e => handleGenSessionChange(e.target.value)} required>
                      <option value="">Select session</option>
                      {sessionsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Student</h2>
                    <select className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={genForm.studentId} onChange={e => handleGenStudentChange(e.target.value)} required disabled={!genForm.sessionId}>
                      <option value="">Select student</option>
                      {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Certificate Title</h2>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700" value={genForm.title} onChange={handleGenTitleChange} required />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="px-6 py-3 bg-blue-700 text-white rounded hover:bg-blue-800 transition font-semibold w-full">Generate Preview</button>
                  </div>
                </form>
                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-lg font-semibold mb-2">Certificate Details</h2>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {studentsList.find(s => s.id === genForm.studentId)?.name || '-'}</p>
                    <p><span className="font-medium">Date Created:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="font-medium">Type:</span> ScholarProof Certificate</p>
                    <p><span className="font-medium">Status:</span> Active</p>
                  </div>
                </div>
              </div>
              {/* Preview Section */}
              <div className="bg-gray-50 rounded-lg p-6 flex flex-col">
                <h2 className="text-lg font-semibold mb-4">Certificate Preview</h2>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex-1 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[220px]" ref={previewBoxRef} style={{ aspectRatio: '420/297' }}>
                    {showPreview ? (
                      <div
                        style={{
                          width: 420,
                          height: 297,
                          transform: `scale(${certScale})`,
                          transformOrigin: 'top left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CertificateTemplate
                          studentName={studentsList.find(s => s.id === genForm.studentId)?.name || 'Student Name'}
                          title={genForm.title || 'Certificate Title'}
                          description={''}
                          dateIssued={new Date().toLocaleDateString()}
                          revoked={false}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center p-4">
                        Click &quot;Generate Preview&quot; to see your certificate.<br />
                        Download generates a high-resolution PNG.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" onClick={() => { setShowGenModal(false); setShowPreview(false); }} aria-label="Close">&times;</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 