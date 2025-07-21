import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', inviteCode: '', general: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const validate = () => {
    let valid = true;
    let errs = { email: '', password: '', inviteCode: '', general: '' };
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
      return;
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
      return;
    }

    // 4. Mark invite code as used (if applicable)
    if (inviteCode) {
      await supabase
        .from('invite_codes')
        .update({ used: true })
        .eq('code', inviteCode);
    }

    setSuccess('Signup successful! Please check your email to verify your account.');
    setEmail('');
    setPassword('');
    setInviteCode('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow font-sans">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}
      {success && <p className="text-green-600 text-center mb-4">{success}</p>}
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
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
          disabled={loading}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="inviteCode">Invite Code <span className="text-gray-400 text-xs">(optional for students)</span></label>
        <input
          id="inviteCode"
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          disabled={loading}
        />
        <p className="text-gray-500 text-xs mt-1">Leave blank if you're a student. Required for staff sign up.</p>
        {errors.inviteCode && <p className="text-red-500 text-sm mt-1">{errors.inviteCode}</p>}
      </div>
      <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition" disabled={loading}>
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm; 