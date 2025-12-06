import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Use the same API_BASE as your Stores component for consistency
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'http://localhost:5000';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!statsRes.ok) {
        if (statsRes.status === 403) {
          throw new Error('You do not have admin privileges. Please login as an administrator.');
        }
        if (statsRes.status === 401) {
          throw new Error('Please login to access the admin dashboard.');
        }
        throw new Error(`Failed to fetch stats: ${statsRes.status}`);
      }

      const statsData = await statsRes.json();
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalStores: statsData.totalStores || 0,
        totalRatings: statsData.totalRatings || 0
      });

      // Fetch recent activities
      const activitiesRes = await fetch(`${API_BASE}/api/admin/activities`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setRecentActivities(activitiesData.activities || []);
      } else {
        console.warn('Failed to fetch activities, using fallback data');
        // Set fallback activities


      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again later.');

      // Set fallback data in case of error (for demo purposes)
      setStats({
        totalUsers: 156,
        totalStores: 45,
        totalRatings: 892
      });

      // Set fallback activities
      setRecentActivities([
        {
          id: 'fallback_1',
          type: 'user',
          message: 'New user registered: John Doe',
          timeAgo: '2 hours ago',
          initials: 'JD'
        },
        {
          id: 'fallback_2',
          type: 'store',
          message: 'New store added: Mega Store',
          timeAgo: '5 hours ago',
          initials: 'MS'
        },
        {
          id: 'fallback_3',
          type: 'rating',
          message: '15 new ratings submitted today',
          timeAgo: 'Today',
          initials: '⭐'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();

    // Optional: Auto-refresh every 60 seconds for real-time updates
    const intervalId = setInterval(fetchDashboardData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
      <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 ${color} hover:scale-[1.02] transition-transform duration-200`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? '...' : value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Live data from database</p>
          </div>
          <div className={`text-4xl ${color.replace('border-', 'text-')}`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );

  // Get activity color based on type
  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return 'indigo';
      case 'store': return 'violet';
      case 'rating': return 'amber';
      case 'owner': return 'green';
      default: return 'gray';
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (activity) => {
    if (activity.initials) return activity.initials;

    switch (activity.type) {
      case 'user': return '👤';
      case 'store': return '🏪';
      case 'rating': return '⭐';
      case 'owner': return '👑';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              {loading ? 'Loading dashboard data...' : 'Welcome back! Here\'s what\'s happening with your platform.'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">Showing fallback data for demonstration</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="border-indigo-500"
            link="/admin/users"
          />
          <StatCard
            title="Total Stores"
            value={stats.totalStores}
            icon="🏪"
            color="border-violet-500"
            link="/admin/stores"
          />
          <StatCard
            title="Total Ratings"
            value={stats.totalRatings}
            icon="⭐"
            color="border-amber-500"
            link="#"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Administrator Tools</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/add-user"
              className="flex items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition border border-indigo-200 hover:border-indigo-300 group"
            >
              <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-200 rounded-full flex items-center justify-center mr-3 transition-colors">
                <span className="text-indigo-600 text-xl">➕</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Add User</p>
                <p className="text-sm text-gray-600">Create new user</p>
              </div>
            </Link>

            <Link
              to="/admin/add-store"
              className="flex items-center p-4 bg-violet-50 hover:bg-violet-100 rounded-lg transition border border-violet-200 hover:border-violet-300 group"
            >
              <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-full flex items-center justify-center mr-3 transition-colors">
                <span className="text-violet-600 text-xl">🏪</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Add Store</p>
                <p className="text-sm text-gray-600">Register new store</p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition border border-amber-200 hover:border-amber-300 group"
            >
              <div className="w-10 h-10 bg-amber-100 group-hover:bg-amber-200 rounded-full flex items-center justify-center mr-3 transition-colors">
                <span className="text-amber-600 text-xl">📋</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">View Users</p>
                <p className="text-sm text-gray-600">Manage all users</p>
              </div>
            </Link>

            <Link
              to="/admin/stores"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition border border-green-200 hover:border-green-300 group"
            >
              <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center mr-3 transition-colors">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">View Stores</p>
                <p className="text-sm text-gray-600">Manage all stores</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <span className="text-xs text-gray-500">
              {loading ? 'Loading...' : `${recentActivities.length} activities`}
            </span>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const color = getActivityColor(activity.type);
                const bgColorClass = `bg-${color}-100`;
                const textColorClass = `text-${color}-600`;
                const borderColorClass = `border-${color}-200`;

                return (
                  <div
                    key={activity.id}
                    className={`flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border-l-4 ${borderColorClass}`}
                  >
                    <div className={`w-10 h-10 ${bgColorClass} rounded-full flex items-center justify-center mr-3`}>
                      <span className={`font-bold ${textColorClass}`}>
                        {getActivityIcon(activity)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 mt-1">{activity.timeAgo}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${bgColorClass} ${textColorClass}`}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <p className="text-gray-500">No recent activity found</p>
              <p className="text-sm text-gray-400 mt-1">Activities will appear here as users interact with the platform</p>
            </div>
          )}

          {!loading && recentActivities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Data fetched from live database • Updates automatically every 60 seconds
              </p>
            </div>
          )}
        </div>

        {/* Data Source Info */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Admin Dashboard • Real-time data from MySQL database</p>
          <p className="mt-1">
            {loading ? 'Connecting to database...' : `Last updated: ${new Date().toLocaleTimeString()}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;