'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../../../lib/axiosInstance'; // Adjust path as needed
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  // Bypass credentials for testing
  const BYPASS_USERNAME = 'admin';
  const BYPASS_PASSWORD = 'password123';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for bypass credentials first
      if (formData.username === BYPASS_USERNAME && formData.password === BYPASS_PASSWORD) {
        // Simulate successful login with bypass
        localStorage.setItem('token', 'bypass-token-123');
        router.push('/dashboard/overview');
        return;
      }

      // If not bypass credentials, proceed with normal API call
      const response = await axiosInstance.post('/login', {
        username: formData.username,
        password: formData.password
      });

      // Handle successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard/overview'); // Redirect to dashboard or desired page
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-5xl flex items-center gap-8">
        
        {/* Left Side - Stethoscope Image */}
        <div className="hidden lg:flex flex-1 justify-center items-center">
          <div className="relative w-80 h-80">
            {/* Placeholder for stethoscope image - replace with your actual image */}
            <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-gray-200">
              <Image
                src="/assets/images/Login_screen_image.jpeg"
                alt="Stethoscope"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-teal-600 mb-2">Login</h1>
            {/* Test credentials display - remove in production */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p className="text-yellow-800 font-medium">Test Credentials:</p>
              <p className="text-yellow-700">Username: <span className="font-mono">admin</span></p>
              <p className="text-yellow-700">Password: <span className="font-mono">password123</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-teal-600 hover:text-teal-800 transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}