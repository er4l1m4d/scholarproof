import DashboardLayout from '@/app/components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';

export default function AdminCertificatesPage() {
  const { role, loading, error } = useUserRole();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;
  return (
    <DashboardLayout role="admin">
      <div className="text-center text-gray-600 text-xl">Admin Certificates view coming soon!</div>
    </DashboardLayout>
  );
} 