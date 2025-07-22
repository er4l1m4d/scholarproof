export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Unauthorized</h1>
        <p className="text-gray-600 dark:text-gray-300">You do not have permission to access this page.</p>
      </div>
    </main>
  );
} 