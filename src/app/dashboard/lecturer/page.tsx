"use client";
import DashboardLayout from '../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { getSessionSummaries } from '@/app/utils/getSessionSummaries';
import { getStudentSummaries } from '@/app/utils/getStudentSummaries';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface SessionSummary {
  id: string;
  name: string;
  created_at: string;
  certCount: number;
}

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  certCount: number;
}

export default function LecturerDashboard() {
  const { role, loading, error } = useUserRole();
  const [name, setName] = useState<string | null>(null);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [studentSummaryLoading, setStudentSummaryLoading] = useState(true);
  const [studentSummaryError, setStudentSummaryError] = useState<string | null>(null);
  const [selectedStudentSessionId, setSelectedStudentSessionId] = useState<string>('all');

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

  useEffect(() => {
    async function fetchSummaries() {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const data = await getSessionSummaries();
        setSessionSummaries(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setSummaryError(err.message);
        } else {
          setSummaryError('Failed to fetch session summaries');
        }
      } finally {
        setSummaryLoading(false);
      }
    }
    fetchSummaries();
  }, []);

  useEffect(() => {
    async function fetchStudentSummaries() {
      setStudentSummaryLoading(true);
      setStudentSummaryError(null);
      try {
        const data = await getStudentSummaries();
        setStudentSummaries(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setStudentSummaryError(err.message);
        } else {
          setStudentSummaryError('Failed to fetch student summaries');
        }
      } finally {
        setStudentSummaryLoading(false);
      }
    }
    fetchStudentSummaries();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">Loading...</div>;
  if (error || role !== 'lecturer') return <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">Unauthorized</div>;

  return (
    <DashboardLayout role="lecturer" setName={setName}>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
          {name ? `Welcome, ${name}! 👨‍🏫` : 'Welcome! Please update your profile name.'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">This is your lecturer dashboard.</p>
      </div>
      {/* Session Summary Section */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4 text-left">Session Summary</h2>
        {/* Session Filter Dropdown */}
        {sessionSummaries.length > 0 && (
          <div className="mb-6 text-left">
            <label className="block mb-1 font-medium" htmlFor="session-filter">Filter by Session</label>
            <select
              id="session-filter"
              className="border rounded px-3 py-2 w-full max-w-xs"
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
            >
              <option value="all">All Sessions</option>
              {sessionSummaries.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
        {summaryLoading ? (
          <div className="text-gray-500 dark:text-gray-300">Loading session summary...</div>
        ) : summaryError ? (
          <div className="text-red-600 dark:text-red-400">{summaryError}</div>
        ) : sessionSummaries.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">No sessions found.</div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-left">Session Name</th>
                    <th className="px-4 py-2 text-left">Created At</th>
                    <th className="px-4 py-2 text-left">Certificates Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedSessionId === 'all' ? sessionSummaries : sessionSummaries.filter(s => s.id === selectedSessionId)).map((s) => (
                    <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">{s.created_at ? s.created_at.slice(0, 10) : 'N/A'}</td>
                      <td className="px-4 py-2">{s.certCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Bar Chart */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedSessionId === 'all' ? sessionSummaries : sessionSummaries.filter(s => s.id === selectedSessionId)} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="certCount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
      {/* Student Summary Section */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4 text-left">Student Summary</h2>
        {/* Session Filter Dropdown for Student Summary */}
        {sessionSummaries.length > 0 && (
          <div className="mb-6 text-left">
            <label className="block mb-1 font-medium" htmlFor="student-session-filter">Filter by Session</label>
            <select
              id="student-session-filter"
              className="border rounded px-3 py-2 w-full max-w-xs"
              value={selectedStudentSessionId}
              onChange={e => setSelectedStudentSessionId(e.target.value)}
            >
              <option value="all">All Sessions</option>
              {sessionSummaries.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
        {studentSummaryLoading ? (
          <div className="text-gray-500 dark:text-gray-300">Loading student summary...</div>
        ) : studentSummaryError ? (
          <div className="text-red-600 dark:text-red-400">{studentSummaryError}</div>
        ) : studentSummaries.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">No students found.</div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-left">Student Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Certificates Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedStudentSessionId === 'all'
                    ? studentSummaries
                    : studentSummaries.filter(s => s.certCount > 0 && sessionSummaries.find(sess => sess.id === selectedStudentSessionId && sess.certCount > 0)))
                    .map((s) => (
                    <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">{s.email}</td>
                      <td className="px-4 py-2">{s.certCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Bar Chart */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedStudentSessionId === 'all'
                  ? studentSummaries
                  : studentSummaries.filter(s => s.certCount > 0 && sessionSummaries.find(sess => sess.id === selectedStudentSessionId && sess.certCount > 0))} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="certCount" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 