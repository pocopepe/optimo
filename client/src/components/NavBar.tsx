import React from 'react';
import type { NavigationLink, NavBarProps } from '../types';

const NavBar: React.FC<NavBarProps> = ({ brandName, navLinks, navigate }) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Brand Name */}
        <a onClick={() => navigate('/')} className="text-xl font-bold cursor-pointer">
          {brandName}
        </a>

        {/* Navigation Links + Login Button */}
        <div className="flex items-center space-x-6">
          {navLinks.map((link: NavigationLink) => (
            <a
              key={link.href}
              onClick={() => navigate(link.href)}
              className="hover:text-gray-300 cursor-pointer transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}

          {/* Customer Login Button */}
          <button
            onClick={() => navigate('/customer-login')}
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-300"
          >
            Customer Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
