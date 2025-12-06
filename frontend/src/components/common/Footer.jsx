import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-8">
      {/* FULL WIDTH FOOTER CONTAINER */}
      <div 
        className="bg-gradient-to-r from-violet-600 to-violet-700 text-white"
        style={{
          width: '100vw',
          marginLeft: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm">
          <span>Store Ratings © 2025</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;