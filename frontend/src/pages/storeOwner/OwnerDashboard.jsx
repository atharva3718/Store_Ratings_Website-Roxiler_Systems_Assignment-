import { useEffect, useState } from 'react';
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:5000';

const OwnerDashboard = () => {
  const [avg, setAvg] = useState(0);
  const [raters, setRaters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stores/mine`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.message || 'Failed');
        const store = data.store || { avgRating: 0, raters: [] };
        if (!cancelled) {
          setAvg(Number(store.avgRating || 0));
          setRaters(store.raters || []);
        }
      } catch (e) {
        if (!cancelled) { setAvg(0); setRaters([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Star rating display component
  const StarRating = ({ rating, showNumber = false }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-amber-400 text-2xl">⭐</span>);
    }

    // Add half star if needed
    if (hasHalfStar && fullStars < 5) {
      stars.push(<span key="half" className="text-amber-400 text-2xl">⭐</span>);
    }

    // Add empty stars
    const totalStars = hasHalfStar ? fullStars + 1 : fullStars;
    for (let i = totalStars; i < 5; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300 text-2xl">☆</span>);
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        {showNumber && <span className="ml-2 text-xl font-semibold text-gray-700">({rating.toFixed(1)})</span>}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Owner Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-sm text-gray-600 mb-3">Average Rating</p>
          {loading ? (
            <p className="text-2xl text-gray-400">Loading...</p>
          ) : (
            <StarRating rating={avg} showNumber={true} />
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-500">
          <p className="text-sm text-gray-600 mb-1">Total Raters</p>
          <p className="text-3xl font-bold text-gray-800">{loading ? '...' : raters.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Recent Ratings</h2>
        </div>
        {loading ? (
          <div className="p-6 text-gray-600">Loading...</div>
        ) : raters.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">No ratings yet</div>
        ) : (
          <div className="divide-y">
            {raters.map(r => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between">
                <p className="font-medium text-gray-800">{r.name}</p>
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} showNumber={false} />
                  <span className="text-sm text-gray-600">({r.rating})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
