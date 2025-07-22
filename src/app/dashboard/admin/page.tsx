"use client";
import DashboardLayout from '../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';

export default function AdminDashboard() {
  const { role, loading, error } = useUserRole();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;
  return (
    <DashboardLayout role="admin">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome, admin! 🛡️</p>
      </div>
    </DashboardLayout>
  );
} 