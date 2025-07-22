"use client";
import DashboardLayout from '../../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

interface Student {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface Certificate {
  id: string;
  title?: string;
  created_at?: string;
  status?: string;
  session?: { id: string; name: string };
}

interface RawCertificate {
  id: string;
  title?: string;
  created_at?: string;
  status?: string;
  sessions?: { id: string; name: string }[];
}

export default function AdminStudentsPage() {
  const { role, loading, error } = useUserRole();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [fetchError, setFetchError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [certsError, setCertsError] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      fetchStudents(page);
    }
    // eslint-disable-next-line
  }, [role, page]);

  async function fetchStudents(pageNum: number) {
    setLoadingStudents(true);
    setFetchError('');
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('users')
      .select('id, name, email, role', { count: 'exact' })
      .order('name', { ascending: true })
      .range(from, to);
    if (error || !data) {
      setFetchError('Could not fetch students');
      setStudents([]);
      setTotalCount(0);
    } else {
      setStudents(data.filter((u: Student) => u.role === 'student'));
      setTotalCount(count || 0);
    }
    setLoadingStudents(false);
  }

  async function openStudentModal(student: Student) {
    setSelectedStudent(student);
    setLoadingCerts(true);
    setCertsError('');
    // Fetch certificates for this student
    const { data, error } = await supabase
      .from('certificates')
      .select('id, title, created_at, status, sessions(id, name)')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });
    if (error || !data) {
      setCertsError('Could not fetch certificates');
      setCertificates([]);
    } else {
      setCertificates(
        data.map((cert: RawCertificate) => ({
          ...cert,
          session: cert.sessions && cert.sessions.length > 0 ? cert.sessions[0] : undefined,
        }))
      );
    }
    setLoadingCerts(false);
  }

  function closeStudentModal() {
    setSelectedStudent(null);
    setCertificates([]);
    setCertsError('');
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">Unauthorized</div>;

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-6">Students</h2>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        {loadingStudents ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-300">Loading students...</div>
        ) : fetchError ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400">{fetchError}</div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Name</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Email</th>
                  <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="py-2 px-3 border font-medium text-gray-900 dark:text-gray-100">{student.name || '-'}</td>
                    <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{student.email || '-'}</td>
                    <td className="py-2 px-3 border">
                      <button className="text-blue-700 dark:text-blue-300 hover:underline" onClick={() => openStudentModal(student)}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Pagination controls */}
      {totalCount > 0 && (
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
      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold" onClick={closeStudentModal} aria-label="Close">&times;</button>
            <h3 className="text-xl font-bold mb-2 text-blue-800 dark:text-blue-200">{selectedStudent.name || selectedStudent.email}</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Email: {selectedStudent.email}</p>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Certificate History</h4>
            {loadingCerts ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-300">Loading certificates...</div>
            ) : certsError ? (
              <div className="text-center py-4 text-red-500 dark:text-red-400">{certsError}</div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-4 text-gray-400 dark:text-gray-500">No certificates found for this student.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Title</th>
                      <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Session</th>
                      <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Date Issued</th>
                      <th className="py-2 px-3 border text-gray-900 dark:text-gray-100">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map(cert => (
                      <tr key={cert.id}>
                        <td className="py-2 px-3 border font-medium text-gray-900 dark:text-gray-100">{cert.title || '-'}</td>
                        <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{cert.session?.name || '-'}</td>
                        <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : '-'}</td>
                        <td className="py-2 px-3 border text-gray-900 dark:text-gray-100">{cert.status || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 