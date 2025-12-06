import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:5000';

const StoreDetails = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stores/${storeId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load store');
        const data = await res.json();
        if (!cancelled) setStore(data.store || null);
      } catch (err) {
        if (!cancelled) setStore(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [storeId]);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!store) return (
    <div className="p-6">
      <p className="text-gray-600 mb-4">Store not found</p>
      <button onClick={() => navigate('/admin/stores')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/admin/stores')} className="text-indigo-600 hover:text-indigo-800 mb-4">← Back to Stores</button>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{store.name}</h1>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-500">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-medium text-gray-800">{store.email}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <p className="text-sm text-gray-600 mb-1">Average Rating</p>
            <p className="text-2xl font-bold text-gray-800">{store.avgRating.toFixed(1)} ★</p>
            <p className="text-sm text-gray-500">{store.totalRatings} ratings</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Raters</h2>
          </div>
          <div className="divide-y">
            {store.raters.map(r => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between">
                <p className="font-medium text-gray-800">{r.name}</p>
                <span className="text-amber-600 font-semibold">{r.rating} ★</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;






