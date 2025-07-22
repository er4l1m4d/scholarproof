import DashboardLayout from '../../../components/DashboardLayout';
import { useUserRole } from '@/app/hooks/useUserRole';

export default function LecturerCertificatesPage() {
  const { role, loading, error } = useUserRole();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || role !== 'lecturer') return <div className="min-h-screen flex items-center justify-center text-red-600">Unauthorized</div>;
  return (
    <DashboardLayout role="lecturer">
      <div className="text-center text-gray-600 text-xl">Lecturer Certificates view coming soon!</div>
    </DashboardLayout>
  );
} 