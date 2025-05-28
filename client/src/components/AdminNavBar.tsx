import React from 'react';
import type { AdminNavBarProps } from '../types';

const AdminNavBar: React.FC<AdminNavBarProps> = ({ brandName, navigate, onLogout, userRole }) => {
  // Hardcoded value for patients in queue - you can replace this later
  const patientsInQueueCount = 7; 

  const adminNavLinks = [
    { href: `/${userRole}/dashboard`, label: 'My Dashboard' },
    { href: '/patients-in-queue', label: `Patients in Queue (${patientsInQueueCount})` }, // New button/link
  ];

  return (
    <nav className="p-4 bg-gray-900 text-white flex justify-between items-center shadow-lg"> {/* Added shadow */}
      <div className="flex items-center">
        <a onClick={() => navigate('/')} className="text-xl font-bold cursor-pointer text-purple-300 hover:text-purple-400 transition-colors duration-200"> {/* Navigate to home on brand click */}
          {brandName}
        </a>
        <div className="ml-8 flex space-x-6"> {/* Increased spacing */}
          {adminNavLinks.map(link => (
            <a
              key={link.href}
              onClick={() => navigate(link.href)}
              className="hover:text-purple-200 cursor-pointer text-base font-medium transition-colors duration-200" // Adjusted styling
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <span className="mr-4 text-sm text-gray-400">Logged in as: <strong className="capitalize text-purple-300">{userRole}</strong></span>
        <button
          onClick={onLogout}
          className="py-1.5 px-4 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold transition-colors duration-200 shadow-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavBar;