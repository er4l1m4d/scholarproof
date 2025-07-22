"use client";
import DashboardLayout from '../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const { role, loading, error } = useUserRole();
  const [name, setName] = useState<string | null>(null);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;

  return (
    <DashboardLayout role="admin" name={name || undefined} setName={setName}>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
          {name ? `Welcome, ${name}! 🛡️` : 'Welcome! Please update your profile name.'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">This is your admin dashboard.</p>
      </div>
    </DashboardLayout>
  );
} 