"use client";
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully!');
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
    >
      Logout
    </button>
  );
} 