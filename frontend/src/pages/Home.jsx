import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';
import img1 from '../assets/images/cheerful-young-family-with-child.jpg';
import img2 from '../assets/images/male-shop-assistant-helps-young-couple-choose-new-home-appliance.jpg';
import img3 from '../assets/images/teenagers-reading-textbooks-stairway.jpg';

const Home = () => {
  const { user } = useAuthContext();
  const images = [img1, img2, img3];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full">
        {/* Hero Carousel with Blurred Background - FULL VIEWPORT WIDTH */}
        <div className="relative mb-8">
          {/* Extended blur container - FULL VIEWPORT WIDTH */}
          <div 
            className="absolute inset-y-0 -top-8 -bottom-8 bg-gradient-to-r from-black/70 via-black/50 to-black/70 backdrop-blur-3xl"
            style={{
              width: '100vw',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
            }}
          >
            {/* This creates the extended blur effect from edge to edge */}
          </div>
          
          <div className="relative py-10">
            {/* Carousel Container - NO side margins */}
            <div className="relative">
              {/* Carousel with reduced side padding */}
              <div className="relative w-full h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden shadow-[0_25px_80px_-10px_rgba(0,0,0,0.9)]">
                {/* Background Images */}
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={
                      i === 0
                        ? 'Happy family shopping'
                        : i === 1
                          ? 'Shop assistant helping a couple choose an appliance'
                          : 'Teenagers reading on a stairway'
                    }
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    aria-hidden={i !== index}
                    loading={i === index ? 'eager' : 'lazy'}
                  />
                ))}

                {/* Dark Overlay for Better Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />

                {/* Hero Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 drop-shadow-2xl">
                    Rate Stores.<br />Share Opinions.
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mb-8 drop-shadow-lg">
                    Discover the best stores and share your experiences with the community
                  </p>

                  {/* CTA Button */}
                  {!user ? (
                    <Link
                      to="/login"
                      className="px-8 py-4 bg-amber-500 text-white text-lg font-semibold rounded-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
                    >
                      Get Started
                    </Link>
                  ) : (
                    <>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="px-8 py-4 bg-amber-500 text-white text-lg font-semibold rounded-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
                        >
                          Go to Dashboard
                        </Link>
                      )}
                      {user.role === 'user' && (
                        <Link
                          to="/user/stores"
                          className="px-8 py-4 bg-amber-500 text-white text-lg font-semibold rounded-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
                        >
                          Browse Stores
                        </Link>
                      )}
                      {user.role === 'store_owner' && (
                        <Link
                          to="/owner/dashboard"
                          className="px-8 py-4 bg-amber-500 text-white text-lg font-semibold rounded-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
                        >
                          Owner Dashboard
                        </Link>
                      )}
                    </>
                  )}
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2.5 rounded-full transition-all ${i === index ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/90 w-2.5'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content section - WIDER CARD */}
        <div className="relative mt-8 sm:mt-12 lg:mt-16">
          {/* WIDER CARD with minimal side margins */}
          <div className="px-2 sm:px-4 lg:px-6">
            <div className="bg-gradient-to-br from-violet-200 via-violet-300 to-violet-400 rounded-xl p-8 pt-6 border border-violet-300">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-3 text-center">
                Why Choose Us?
              </h2>
              <p className="text-gray-700 max-w-3xl mx-auto text-center">Discover trusted stores through community-powered ratings. Compare experiences, read detailed reviews, and make confident choices. Store owners receive actionable insights to improve service, while users enjoy a clean, fast, and secure platform to share honest opinions.</p>

              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {!user ? (
                  <><Link to="/signup" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
                      Create account
                    </Link>
                  </>
                ) : (
                  <>
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
                        Go to Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'user' && (
                      <Link to="/user/stores" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
                        Browse Stores
                      </Link>
                    )}
                    {user.role === 'store_owner' && (
                      <Link to="/owner/dashboard" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
                        Owner Dashboard
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
