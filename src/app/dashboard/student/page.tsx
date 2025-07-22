"use client";
import { useState } from "react";

export default function StudentDashboard() {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  // Placeholder session options
  const sessionOptions = [
    { id: 'all', name: 'All Sessions' },
    { id: '2024-term1', name: '2024/Term 1' },
    { id: '2023-term2', name: '2023/Term 2' },
  ];

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
        {/* Sort & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div>
            <label className="mr-2 font-medium text-sm text-gray-700">Sort:</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div>
            <label className="mr-2 font-medium text-sm text-gray-700">Session:</label>
            <select
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {sessionOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placeholder for certificate cards */}
          <div className="col-span-full text-center text-gray-400">No certificates found. (Data will appear here)</div>
        </div>
      </div>
    </main>
  );
} 