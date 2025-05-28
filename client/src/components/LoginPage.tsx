import React, { useState } from 'react';
import type { LoginPageProps } from '../types';

const LoginPage: React.FC<LoginPageProps> = ({ navigate, role }) => {
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError('');

    try {
      // *** CHANGE THIS LINE ***
      const response = await fetch('https://server.avijusanjai.workers.dev/login', { // Changed to 8787
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeCode, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('authToken', data.token);
      navigate('/admin');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Network error: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div className="p-4 bg-gray-700 text-white rounded shadow mx-auto max-w-sm">
      <h1 className="text-xl font-bold mb-4 capitalize">{role} Login</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="employeeCode" className="block text-sm font-medium mb-1">Employee Code:</label>
          <input
            type="text"
            id="employeeCode"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            required
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;