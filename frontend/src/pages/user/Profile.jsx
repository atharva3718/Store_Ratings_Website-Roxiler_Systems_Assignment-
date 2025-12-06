import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';

const Profile = () => {
  const { user } = useAuthContext();
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setOk('');
  };

  const validate = () => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!regex.test(form.password)) return 'Password must be 8-16 chars, include 1 uppercase & 1 special';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return '';
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    console.log('update password', form);
    setOk('Password updated successfully (demo)');
    setForm({ current: '', password: '', confirm: '' });
    setShowPwd(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-xl mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-800">{user?.name || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-800">{user?.email || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500">Address</p>
            <p className="font-medium text-gray-800">{user?.address || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-medium text-gray-800">{user?.role || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium text-gray-800">{user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}</p>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={() => setShowPwd(true)} className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">Update Password</button>
        </div>
      </div>

      {showPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
              <button onClick={() => setShowPwd(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {error && <div className="mb-3 p-3 text-red-700 bg-red-100 border border-red-300 rounded">{error}</div>}
            {ok && <div className="mb-3 p-3 text-green-700 bg-green-100 border border-green-300 rounded">{ok}</div>}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="current"
                  value={form.current}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">Save</button>
                <button type="button" onClick={() => setShowPwd(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

