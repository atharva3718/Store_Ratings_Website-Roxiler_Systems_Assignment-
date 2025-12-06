import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';
import Toast from '../../components/common/Toast.jsx';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const emailRef = useRef(null);
  const roleRef = useRef(null);
  const passwordRef = useRef(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) errs.email = 'Enter a valid email address';
    const allowedRoles = ['user', 'admin', 'store_owner'];
    if (!allowedRoles.includes(formData.role)) errs.role = 'Please select a role';
    if (!formData.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      const bad = errs.email ? emailRef : errs.role ? roleRef : passwordRef;
      bad?.current?.focus();
      bad?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    try {
      const user = await login(formData);
      setSuccess('Logged in successfully');
      const doNav = () => {
        const redirect = location.state?.from?.pathname;
        if (redirect) return navigate(redirect, { replace: true });
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'store_owner') navigate('/owner/dashboard');
        else navigate('/user/stores');
      };
      setTimeout(doNav, 900);
    } catch (err) {
      const lower = (err?.message || '').toLowerCase();
      setError(lower.includes('role mismatch') ? 'Selected role does not match this account' : 'Invalid email or password');
      passwordRef?.current?.focus();
      passwordRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 flex items-center justify-center p-4">
      {success && (
        <Toast message={success} onClose={() => setSuccess('')} />
      )}
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 rounded-lg shadow-md p-8 border border-violet-200">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-violet-600 mb-2">Store Ratings</h1>
            <p className="text-gray-600">Login to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                ref={roleRef}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${fieldErrors.role ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
                <option value="admin">Admin</option>
              </select>
              {fieldErrors.role && <p className="text-red-500 text-xs mt-1">{fieldErrors.role}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                ref={emailRef}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your email"
                required
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              {formData.role === 'admin' && (
                <p className="text-gray-500 text-xs mt-1 opacity-60">Email: admin123@gmail.com</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                ref={passwordRef}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your password"
                required
              />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
              {formData.role === 'admin' && (
                <p className="text-gray-500 text-xs mt-1 opacity-60">Password: Admin@StoreRatings</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition duration-200 font-semibold disabled:bg-amber-300"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-violet-600 hover:text-violet-800 font-semibold">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">Store Ratings © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

