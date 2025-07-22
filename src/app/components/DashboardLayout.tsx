"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  role: 'admin' | 'lecturer';
  children: React.ReactNode;
}

const sidebarTabs = {
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin' },
    { name: 'Sessions', href: '/dashboard/admin/sessions' },
    { name: 'Certificates', href: '/dashboard/admin/certificates' },
    { name: 'Students', href: '/dashboard/admin/students' },
    { name: 'Invite Codes', href: '/dashboard/admin/invite-codes' },
  ],
  lecturer: [
    { name: 'Dashboard', href: '/dashboard/lecturer' },
    { name: 'My Sessions', href: '/dashboard/lecturer/sessions' },
    { name: 'Certificates', href: '/dashboard/lecturer/certificates' },
  ],
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, children }) => {
  const pathname = usePathname();
  const tabs = sidebarTabs[role];

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-6 px-4">
        <div className="mb-8">
          <span className="text-xl font-bold text-blue-800">ScholarProof</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {tabs.map(tab => (
              <li key={tab.name}>
                <Link
                  href={tab.href}
                  className={`block px-4 py-2 rounded transition font-medium ${
                    pathname === tab.href
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Placeholder avatar */}
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
              <span>{role.charAt(0).toUpperCase()}</span>
            </div>
            {/* Menu */}
            <div className="relative group">
              <button className="px-3 py-1 rounded hover:bg-gray-100 transition font-medium">Menu ▾</button>
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                <Link href="#" className="block px-4 py-2 hover:bg-gray-100">Edit Profile</Link>
                <Link href="/logout" className="block px-4 py-2 hover:bg-gray-100">Logout</Link>
              </div>
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 