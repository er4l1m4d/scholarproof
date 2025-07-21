export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-700 mb-2">Unauthorized</h1>
        <p className="text-gray-600">You do not have permission to access this page.</p>
      </div>
    </main>
  );
} 