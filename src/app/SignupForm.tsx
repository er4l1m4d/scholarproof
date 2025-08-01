"use client";

import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', inviteCode: '', general: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const validate = () => {
    let valid = true;
    const errs = { email: '', password: '', inviteCode: '', general: '' };
    if (!email) {
      errs.email = 'Email is required.';
      valid = false;
    }
    if (!password) {
      errs.password = 'Password is required.';
      valid = false;
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
      valid = false;
    }
    setErrors(errs);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setErrors({ email: '', password: '', inviteCode: '', general: '' });
    if (!validate()) return;
    setLoading(true);
    let assignedRole = 'student';

    // Invite code logic
    if (inviteCode) {
      // 1. Check invite code
      const { data: invite, error: inviteError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', inviteCode)
        .eq('used', false)
        .single();
      if (inviteError || !invite) {
        setErrors(errs => ({ ...errs, inviteCode: 'Invalid or used invite code.' }));
        setLoading(false);
        toast.error('Invalid or used invite code.');
        return;
      }
      assignedRole = invite.role;
    }

    // 2. Sign up user
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError || !authUser.user) {
      setErrors(errs => ({ ...errs, general: signUpError?.message || 'Signup failed.' }));
      setLoading(false);
      toast.error(signUpError?.message || 'Signup failed.');
      return;
    }
    // Set session cookie for middleware (if session exists)
    if (authUser.session) {
      await supabase.auth.setSession(authUser.session);
    }

    // 3. Insert into users table
    const { error: userInsertError } = await supabase.from('users').insert({
      id: authUser.user.id,
      email: authUser.user.email,
      role: assignedRole,
    });
    if (userInsertError) {
      setErrors(errs => ({ ...errs, general: userInsertError.message }));
      setLoading(false);
      toast.error(userInsertError.message);
      return;
    }

    // 4. Mark invite code as used (if applicable)
    if (inviteCode) {
      await supabase
        .from('invite_codes')
        .update({ used: true })
        .eq('code', inviteCode);
    }

    // Redirect to dashboard based on role
    if (assignedRole === 'student') {
      router.push('/dashboard/student');
    } else if (assignedRole === 'lecturer') {
      router.push('/dashboard/lecturer');
    } else if (assignedRole === 'admin') {
      router.push('/dashboard/admin');
    }

    toast.success('Signup successful! Please check your email to verify your account.');
    setEmail('');
    setPassword('');
    setInviteCode('');
    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow font-sans">
        <img src="/ScholarProof Logo.png" alt="ScholarProof Logo" className="mx-auto mb-4 h-12 w-12" />
        <h2 className="text-2xl font-black mb-6 text-center text-[#174AE6]">Sign Up</h2>
        {errors.general && <p className="text-red-500 text-center mb-4 font-medium">{errors.general}</p>}
        {success && <p className="text-green-600 text-center mb-4 font-medium">{success}</p>}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-900" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white text-gray-900 font-medium"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1 font-medium">{errors.email}</p>}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-900" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white text-gray-900 font-medium"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1 font-medium">{errors.password}</p>}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-900" htmlFor="inviteCode">Invite Code <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">(optional for students)</span></label>
          <input
            id="inviteCode"
            type="text"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white text-gray-900 font-medium"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            disabled={loading}
          />
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">Leave blank if you&apos;re a student. Required for staff sign up.</p>
          {errors.inviteCode && <p className="text-red-500 dark:text-red-400 text-sm mt-1 font-medium">{errors.inviteCode}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition font-medium" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300 font-medium">
          Already have an account?{' '}
          <a href="/login" className="text-blue-700 dark:text-blue-300 hover:underline font-medium">Login here</a>
        </p>
      </form>
    </>
  );
};

export default SignupForm; 