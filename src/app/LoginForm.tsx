"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const router = useRouter();

  const validate = () => {
    let valid = true;
    const errs = { email: '', password: '' };
    if (!email) {
      errs.email = 'Email is required.';
      valid = false;
    }
    if (!password) {
      errs.password = 'Password is required.';
      valid = false;
    }
    setErrors(errs);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Supabase login logic
    const { data: authUser, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError || !authUser.user) {
      setErrors(errs => ({ ...errs, password: loginError?.message || 'Login failed.' }));
      toast.error(loginError?.message || 'Login failed.');
      return;
    }
    // Set session cookie for middleware
    if (authUser.session) {
      await supabase.auth.setSession(authUser.session);
    }
    // Fetch user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.user.id)
      .single();
    if (userError || !userData) {
      setErrors(errs => ({ ...errs, password: 'Could not fetch user role.' }));
      toast.error('Could not fetch user role.');
      return;
    }
    // Redirect to dashboard based on role
    if (userData.role === 'student') router.push('/dashboard/student');
    else if (userData.role === 'lecturer') router.push('/dashboard/lecturer');
    else if (userData.role === 'admin') router.push('/dashboard/admin');
    toast.success('Login successful!');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow font-sans">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">Login</button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-700 hover:underline">Sign up here</a>
        </p>
      </form>
    </>
  );
};

export default LoginForm; 