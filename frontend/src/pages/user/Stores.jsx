import { useEffect, useMemo, useState } from 'react';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:5000';

// Fixed StarRating component
const StarRating = ({ value, onChange, interactive = true }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => interactive && onChange(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-2xl ${interactive ? 'cursor-pointer' : 'cursor-default'} ${star <= (hover || value) ? 'text-amber-500' : 'text-gray-300'
            }`}
          aria-label={`Rate ${star} stars`}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const Stores = () => {
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRatings, setMyRatings] = useState({});
  const [savedRatings, setSavedRatings] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stores`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.message || 'Failed to load stores');
        if (!cancelled) {
          const list = data.stores || [];
          setStores(list);
          setMyRatings(Object.fromEntries((list || []).filter(s => s.myRating).map(s => [s.id, s.myRating])));
        }
      } catch (e) {
        if (!cancelled) setStores([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = stores || [];
    if (!q) return base;
    return base.filter(
      s => s.name.toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q)
    );
  }, [query, stores]);

  const setRating = (id, value) => {
    setMyRatings((m) => ({ ...m, [id]: value }));
  };

  const submitRating = async (id) => {
    const rating = myRatings[id] || 0;
    if (!rating) return;
    const res = await fetch(`${API_BASE}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ storeId: id, rating }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    const updated = data.store;
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));

    // Show success message
    setSavedRatings((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedRatings((prev) => ({ ...prev, [id]: false }));
    }, 3000);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading stores...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Stores</h1>
        <p className="text-gray-600">Search stores and submit your ratings.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or address..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No stores found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((store) => {
            const currentRating = myRatings[store.id] ?? store.myRating ?? 0;

            return (
              <div key={store.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-sm font-medium">
                      <span className="mr-1">★</span>
                      {Number(store.avgRating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">Your rating</p>
                      <div className="flex items-center space-x-3">
                        <StarRating
                          value={currentRating}
                          onChange={(v) => setRating(store.id, v)}
                          interactive={true}
                        />
                        <span className="text-sm text-gray-600">
                          {currentRating > 0 ? `${currentRating}.0` : 'Not rated'}
                        </span>
                      </div>
                    </div>
                    <button
                      className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${currentRating > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      onClick={() => currentRating > 0 && submitRating(store.id)}
                      disabled={currentRating === 0}
                    >
                      {currentRating > 0 ? 'Save Rating' : 'Rate to Save'}
                    </button>
                  </div>
                  {savedRatings[store.id] && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                      <p className="text-sm text-green-700 font-medium text-center">✓ Rating saved!</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stores;