import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-4">😅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">Looks like you took a wrong turn.</p>
        <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

