"use client";
import DashboardLayout from '../../../components/DashboardLayout';
import { useUserRole } from '@/utils/useUserRole';
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

type InviteCode = {
  code: string;
  role: 'lecturer' | 'admin';
  used: boolean;
  created_at: string;
};

export default function InviteCodesPage() {
  const { role, loading, error } = useUserRole();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [code, setCode] = useState('');
  const [inviteRole, setInviteRole] = useState('lecturer');
  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch invite codes
  useEffect(() => {
    fetchCodes();
    // eslint-disable-next-line
  }, []);

  async function fetchCodes() {
    setLoadingState(true);
    const { data, error } = await supabase.from('invite_codes').select('*').order('created_at', { ascending: false });
    if (error) setErrorState(error.message);
    else setCodes(data || []);
    setLoadingState(false);
  }

  async function handleAddCode(e: React.FormEvent) {
    e.preventDefault();
    setErrorState('');
    setSuccess('');
    setLoadingState(true);
    if (!code) {
      setErrorState('Code is required.');
      setLoadingState(false);
      return;
    }
    const { error } = await supabase.from('invite_codes').insert({ code, role: inviteRole });
    if (error) setErrorState(error.message);
    else {
      setSuccess('Invite code added!');
      setCode('');
      setInviteRole('lecturer');
      fetchCodes();
      toast.success('Invite code added!');
    }
    setLoadingState(false);
  }

  async function handleDelete(codeToDelete: string) {
    setLoadingState(true);
    setErrorState('');
    setSuccess('');
    const { error } = await supabase.from('invite_codes').delete().eq('code', codeToDelete);
    if (error) setErrorState(error.message);
    else {
      setSuccess('Invite code deleted.');
      fetchCodes();
      toast.success('Invite code deleted.');
    }
    setLoadingState(false);
  }

  async function handleToggleUsed(codeToToggle: string, currentUsed: boolean) {
    setLoadingState(true);
    setErrorState('');
    setSuccess('');
    const { error } = await supabase.from('invite_codes').update({ used: !currentUsed }).eq('code', codeToToggle);
    if (error) setErrorState(error.message);
    else {
      setSuccess(`Invite code marked as ${!currentUsed ? 'used' : 'unused'}.`);
      fetchCodes();
      toast.success(`Invite code marked as ${!currentUsed ? 'used' : 'unused'}.`);
    }
    setLoadingState(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;

  return (
    <DashboardLayout role="admin">
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">Invite Code Management</h1>
          <form onSubmit={handleAddCode} className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              type="text"
              placeholder="Invite code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              disabled={loadingState}
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              disabled={loadingState}
            >
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition font-medium"
              disabled={loadingState}
            >
              Add Code
            </button>
          </form>
          {errorState && <p className="text-red-500 mb-2">{errorState}</p>}
          {success && <p className="text-green-600 mb-2">{success}</p>}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Code</th>
                  <th className="px-4 py-2 border-b">Role</th>
                  <th className="px-4 py-2 border-b">Used</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.code}>
                    <td className="px-4 py-2 border-b">{c.code}</td>
                    <td className="px-4 py-2 border-b">{c.role}</td>
                    <td className="px-4 py-2 border-b">{c.used ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 border-b flex gap-2">
                      <button
                        onClick={() => handleToggleUsed(c.code, c.used)}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                        disabled={loadingState}
                      >
                        Mark as {c.used ? 'Unused' : 'Used'}
                      </button>
                      <button
                        onClick={() => handleDelete(c.code)}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                        disabled={loadingState}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
} 