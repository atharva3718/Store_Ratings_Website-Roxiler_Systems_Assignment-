import React, { useState, useEffect } from 'react';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:5000';

const StoreProfile = () => {
  const [form, setForm] = useState({ name: '', address: '', email: '' });
  const [originalData, setOriginalData] = useState({ name: '', address: '', email: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch store data on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stores/mine`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.message || 'Failed to load store data');

        const store = data.store || {};
        const storeData = {
          name: store.name || '',
          email: store.email || '',
          address: store.address || ''
        };

        if (!cancelled) {
          setForm(storeData);
          setOriginalData(storeData);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/stores/mine`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message || 'Failed to update store');

      setSaved(true);
      setOriginalData(form);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Store Profile</h1>
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <p className="text-gray-600">Loading store information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Store Profile</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={onChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition">
              Save
            </button>
            {saved && <span className="text-sm text-green-700 font-medium">✓ Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreProfile;

