"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { HiOutlineHome, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineUsers, HiOutlineKey } from 'react-icons/hi2';

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
  Dashboard: <HiOutlineHome className="w-5 h-5" />,
  'My Sessions': <HiOutlineCalendar className="w-5 h-5" />,
  Sessions: <HiOutlineCalendar className="w-5 h-5" />,
  Certificates: <HiOutlineDocumentText className="w-5 h-5" />,
  Students: <HiOutlineUsers className="w-5 h-5" />,
  'Invite Codes': <HiOutlineKey className="w-5 h-5" />,
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
  // Remove sidebarCollapsed state and all collapse logic
  // Use only sidebarOpen for toggling
  // Sidebar is always a drawer (overlays content with backdrop)
  // Remove collapse button, always show full icons and labels
  // Hamburger menu toggles sidebar on all screen sizes

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
          fixed z-40 top-0 left-0 h-full bg-white dark:bg-gray-900 border-r flex flex-col py-6 px-4 transition-all duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64
        `}
        style={{ minWidth: 256 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-800 dark:text-blue-200">ScholarProof</span>
          {/* Close button (all screens) */}
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition ml-auto"
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
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {React.cloneElement(icons[tab.name as keyof typeof icons], { className: 'w-5 h-5 text-gray-900 dark:text-gray-100' })}
                  <span>{tab.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-30 dark:bg-opacity-60" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:ml-0" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button
              className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition"
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
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-200 font-bold">
              <span>{role.charAt(0).toUpperCase()}</span>
            </div>
            {/* Menu */}
            <div className="relative group">
              <button className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-gray-900 dark:text-gray-100">Menu ▾</button>
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                <button onClick={() => setShowProfileModal(true)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100">Edit Profile</button>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100">Logout</button>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowProfileModal(false)} aria-label="Close">&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-800">Edit Profile</h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={profileName} onChange={e => setProfileName(e.target.value)} required />
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