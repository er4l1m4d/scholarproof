"use client";

export default function StudentDashboard() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Student Dashboard</h1>
            <p className="text-gray-600">Welcome, student! 🎓</p>
          </div>
          {/* LogoutButton will go here */}
        </div>
        {/* Sort & Filter Controls will go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placeholder for certificate cards */}
          <div className="col-span-full text-center text-gray-400">No certificates found. (Data will appear here)</div>
        </div>
      </div>
    </main>
  );
} 