import LogoutButton from '../../LogoutButton';

export default function LecturerDashboard() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">Lecturer Dashboard</h1>
        <p className="text-gray-600">Welcome, lecturer! 👨‍🏫</p>
        <LogoutButton />
      </div>
    </main>
  );
} 