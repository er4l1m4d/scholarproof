import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: Integrate with Supabase login logic
    alert('Login submitted!');
  };

  return (
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
    </form>
  );
};

export default LoginForm; 