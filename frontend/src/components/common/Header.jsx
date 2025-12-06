import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Admin';
      case 'store_owner': return 'Store Owner';
      case 'user': return 'User';
      default: return 'User';
    }
  };

  return (
    <header className="bg-gradient-to-r from-violet-600 to-violet-700 shadow-md sticky top-0 z-50">
      {/* FULL WIDTH GRADIENT OVERLAY TO COVER WHITE PATCHES */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-700"
        style={{
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SR</span>
              </div>
              <span className="ml-3 text-xl font-bold text-white">Store Ratings</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="text-white/90 hover:text-white font-medium transition">
                      Dashboard
                    </Link>
                    <Link to="/admin/users" className="text-white/90 hover:text-white font-medium transition">
                      Users
                    </Link>
                    <Link to="/admin/stores" className="text-white/90 hover:text-white font-medium transition">
                      Stores
                    </Link>
                  </>
                )}
                {user.role === 'user' && (
                  <>
                    <Link to="/user/stores" className="text-white/90 hover:text-white font-medium transition">
                      Stores
                    </Link>
                    <Link to="/user/profile" className="text-white/90 hover:text-white font-medium transition">
                      Profile
                    </Link>
                  </>
                )}
                {user.role === 'store_owner' && (
                  <>
                    <Link to="/owner/dashboard" className="text-white/90 hover:text-white font-medium transition">
                      Dashboard
                    </Link>
                    <Link to="/owner/profile" className="text-white/90 hover:text-white font-medium transition">
                      Profile
                    </Link>
                  </>
                )}
                
                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <p className="text-white/80">Hello,</p>
                    <p className="font-semibold text-white">{user.name}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
                    {getRoleName(user.role)}
                  </span>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : null}
          </nav>

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && user && (
          <div className="md:hidden py-4 border-t bg-white/80 backdrop-blur border-white/20">
            <div className="space-y-3">
              <div className="px-4 py-2 bg-white rounded">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-violet-100 text-violet-700">
                  {getRoleName(user.role)}
                </span>
              </div>
              
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Users
                  </Link>
                  <Link to="/admin/stores" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Stores
                  </Link>
                </>
              )}
              {user.role === 'user' && (
                <>
                  <Link to="/user/stores" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Stores
                  </Link>
                  <Link to="/user/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Profile
                  </Link>
                </>
              )}
              {user.role === 'store_owner' && (
                <>
                  <Link to="/owner/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Dashboard
                  </Link>
                  <Link to="/owner/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Profile
                  </Link>
                </>
              )}
              
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;