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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Students</h2>
      <div className="bg-white rounded shadow p-4">
        {loadingStudents ? (
          <div className="text-center py-8 text-gray-500">Loading students...</div>
        ) : fetchError ? (
          <div className="text-center py-8 text-red-500">{fetchError}</div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 border">Name</th>
                  <th className="py-2 px-3 border">Email</th>
                  <th className="py-2 px-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="py-2 px-3 border font-medium">{student.name || '-'}</td>
                    <td className="py-2 px-3 border">{student.email || '-'}</td>
                    <td className="py-2 px-3 border">
                      <button className="text-blue-700 hover:underline" onClick={() => openStudentModal(student)}>View Details</button>
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
      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeStudentModal} aria-label="Close">&times;</button>
            <h3 className="text-xl font-bold mb-2 text-blue-800">{selectedStudent.name || selectedStudent.email}</h3>
            <p className="mb-4 text-gray-600">Email: {selectedStudent.email}</p>
            <h4 className="text-lg font-semibold mb-2">Certificate History</h4>
            {loadingCerts ? (
              <div className="text-center py-4 text-gray-500">Loading certificates...</div>
            ) : certsError ? (
              <div className="text-center py-4 text-red-500">{certsError}</div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No certificates found for this student.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 border">Title</th>
                      <th className="py-2 px-3 border">Session</th>
                      <th className="py-2 px-3 border">Date Issued</th>
                      <th className="py-2 px-3 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map(cert => (
                      <tr key={cert.id}>
                        <td className="py-2 px-3 border font-medium">{cert.title || '-'}</td>
                        <td className="py-2 px-3 border">{cert.session?.name || '-'}</td>
                        <td className="py-2 px-3 border">{cert.created_at ? new Date(cert.created_at).toLocaleDateString() : '-'}</td>
                        <td className="py-2 px-3 border">{cert.status || '-'}</td>
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