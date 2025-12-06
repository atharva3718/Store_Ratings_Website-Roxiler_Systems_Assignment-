import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:5000';

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${userId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load user');
        const data = await res.json();
        if (!cancelled) setUser(data.user || null);
      } catch (err) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-700',
      store_owner: 'bg-violet-100 text-violet-700',
      user: 'bg-indigo-100 text-indigo-700'
    };
    const labels = {
      admin: 'Admin',
      store_owner: 'Store Owner',
      user: 'User'
    };
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const StarDisplay = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-lg">
          {star <= rating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            ← Back to Users
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Details</h1>
          <p className="text-gray-600">View detailed information about this user</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
                {getRoleBadge(user.role)}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Email Address</p>
              <p className="text-gray-800">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Role</p>
              <p className="text-gray-800 capitalize">{user.role.replace('_', ' ')}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 font-medium mb-1">Address</p>
              <p className="text-gray-800">{user.address}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Account Created</p>
              <p className="text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Store Owner Info - Only shown if user is a store owner */}
        {user.role === 'store_owner' && user.storeInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Store Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Store Name</p>
                <p className="text-gray-800">{user.storeInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={Math.round(user.storeInfo.avgRating)} />
                  <span className="text-gray-800 font-semibold">
                    {user.storeInfo.avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Stats - Only shown for normal users */}
        {user.role === 'user' && user.ratingStats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rating Activity</h3>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-indigo-700 text-sm font-medium mb-1">Total Ratings</p>
                <p className="text-3xl font-bold text-indigo-600">{user.ratingStats.totalRatings}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-amber-700 text-sm font-medium mb-1">Average Rating Given</p>
                <p className="text-3xl font-bold text-amber-600">
                  {user.ratingStats.averageRating.toFixed(1)} ⭐
                </p>
              </div>
            </div>

            {/* Recent Ratings */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Recent Ratings</h4>
              <div className="space-y-3">
                {user.ratingStats.recentRatings.map((rating, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{rating.storeName}</p>
                      <p className="text-sm text-gray-500">{new Date(rating.date).toLocaleDateString()}</p>
                    </div>
                    <StarDisplay rating={rating.rating} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
          >
            Back to List
          </button>
          <button
            onClick={() => alert('Edit functionality coming soon!')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;





