"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

export default function InviteCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [role, setRole] = useState('lecturer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch invite codes
  useEffect(() => {
    fetchCodes();
  }, []);

  async function fetchCodes() {
    setLoading(true);
    const { data, error } = await supabase.from('invite_codes').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setCodes(data || []);
    setLoading(false);
  }

  async function handleAddCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!code) {
      setError('Code is required.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('invite_codes').insert({ code, role });
    if (error) setError(error.message);
    else {
      setSuccess('Invite code added!');
      setCode('');
      setRole('lecturer');
      fetchCodes();
      toast.success('Invite code added!');
    }
    setLoading(false);
  }

  async function handleDelete(codeToDelete: string) {
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.from('invite_codes').delete().eq('code', codeToDelete);
    if (error) setError(error.message);
    else {
      setSuccess('Invite code deleted.');
      fetchCodes();
      toast.success('Invite code deleted.');
    }
    setLoading(false);
  }

  async function handleToggleUsed(codeToToggle: string, currentUsed: boolean) {
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.from('invite_codes').update({ used: !currentUsed }).eq('code', codeToToggle);
    if (error) setError(error.message);
    else {
      setSuccess(`Invite code marked as ${!currentUsed ? 'used' : 'unused'}.`);
      fetchCodes();
      toast.success(`Invite code marked as ${!currentUsed ? 'used' : 'unused'}.`);
    }
    setLoading(false);
  }

  return (
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
            disabled={loading}
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            disabled={loading}
          >
            <option value="lecturer">Lecturer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition font-medium"
            disabled={loading}
          >
            Add Code
          </button>
        </form>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 border">Code</th>
                <th className="py-2 px-3 border">Role</th>
                <th className="py-2 px-3 border">Used</th>
                <th className="py-2 px-3 border">Created At</th>
                <th className="py-2 px-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c: any) => (
                <tr key={c.code}>
                  <td className="py-2 px-3 border font-mono">{c.code}</td>
                  <td className="py-2 px-3 border capitalize">{c.role}</td>
                  <td className="py-2 px-3 border text-center">{c.used ? '✅' : '❌'}</td>
                  <td className="py-2 px-3 border">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="py-2 px-3 border text-center flex gap-2 justify-center">
                    <button
                      title={c.used ? 'Mark as unused' : 'Mark as used'}
                      onClick={() => handleToggleUsed(c.code, c.used)}
                      className={`px-2 py-1 rounded text-xs font-medium ${c.used ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                      disabled={loading}
                    >
                      {c.used ? 'Mark Unused' : 'Mark Used'}
                    </button>
                    <button
                      title="Delete code"
                      onClick={() => handleDelete(c.code)}
                      className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">No invite codes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 