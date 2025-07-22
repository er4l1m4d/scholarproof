"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

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

// Add SVG icon components for Heroicons
const icons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0H7m6 0v6m0 0h6m-6 0H7" /></svg>
  ),
  'My Sessions': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-10 4h6m-6 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Sessions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-10 4h6m-6 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Certificates: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
  ),
  Students: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-6.13a4 4 0 11-8 0 4 4 0 018 0zm6 6.13A4 4 0 0016 18v2m-8-2a4 4 0 00-4-4" /></svg>
  ),
  'Invite Codes': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zm-2 4v2m0 4h.01" /></svg>
  ),
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, children }) => {
  const pathname = usePathname();
  const tabs = sidebarTabs[role];
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // for desktop

  useEffect(() => {
    if (showProfileModal) {
      fetchProfile();
    }
    // eslint-disable-next-line
  }, [showProfileModal]);

  async function fetchProfile() {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setProfileError('Could not fetch user');
      setProfileLoading(false);
      return;
    }
    // Fetch name from users table
    const { data, error: userError } = await supabase.from('users').select('name').eq('id', user.id).single();
    if (userError || !data) {
      setProfileError('Could not fetch profile');
      setProfileLoading(false);
      return;
    }
    setProfileName(data.name || '');
    setProfileLoading(false);
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setProfileError('Not authenticated');
      setProfileLoading(false);
      return;
    }
    const { error: updateError } = await supabase.from('users').update({ name: profileName }).eq('id', user.id);
    if (updateError) {
      setProfileError(updateError.message);
    } else {
      setProfileSuccess('Profile updated!');
      setTimeout(() => setShowProfileModal(false), 1000);
    }
    setProfileLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar (responsive) */}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-full bg-white border-r flex flex-col py-6 px-4 transition-all duration-200
          md:static md:translate-x-0 md:w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'w-20 md:w-20' : 'w-64'}
          md:flex
        `}
        style={{ minWidth: sidebarCollapsed ? 80 : 256 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className={`text-xl font-bold text-blue-800 transition-all ${sidebarCollapsed ? 'hidden md:inline-block' : ''}`}>ScholarProof</span>
          {/* Collapse button (desktop only) */}
          <button
            className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition ml-auto"
            onClick={() => setSidebarCollapsed(c => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <span className="text-xl">▶</span> : <span className="text-xl">◀</span>}
          </button>
          {/* Close button (mobile only) */}
          <button
            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition ml-auto"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {tabs.map(tab => (
              <li key={tab.name}>
                <Link
                  href={tab.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded transition font-medium ${
                    pathname === tab.href
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  {icons[tab.name as keyof typeof icons]}
                  {!sidebarCollapsed && <span>{tab.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:ml-0" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span className="text-2xl">☰</span>
            </button>
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
                <button onClick={() => setShowProfileModal(true)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit Profile</button>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
              </div>
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowProfileModal(false)} aria-label="Close">&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-800">Edit Profile</h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded" value={profileName} onChange={e => setProfileName(e.target.value)} required />
              </div>
              {profileError && <div className="text-red-600 text-sm">{profileError}</div>}
              {profileSuccess && <div className="text-green-600 text-sm">{profileSuccess}</div>}
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition font-medium" disabled={profileLoading}>{profileLoading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout; 