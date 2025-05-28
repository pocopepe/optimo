import React from 'react';
import type { CommonComponentProps } from '../types';

const Admin: React.FC<CommonComponentProps> = ({ navigate }) => {
  const handleRoleSelect = (rolePath: string): void => {
    navigate(rolePath);
  };

  return (
    <div className="p-8 bg-gray-700 rounded-lg shadow-lg border border-gray-600 text-center">
      <h1 className="text-4xl font-extrabold text-white mb-8">Select Your Role</h1>
      <p className="text-lg text-gray-300 leading-relaxed mb-10">
        Please choose your professional role to access the appropriate dashboard.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <button
          onClick={() => handleRoleSelect('/admin/doctor-login')}
          className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105 aspect-square"
        >
          <span className="text-3xl font-semibold">Doctor</span>
        </button>

        <button
          onClick={() => handleRoleSelect('/admin/nurse-login')}
          className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105 aspect-square"
        >
          <span className="text-3xl font-semibold">Nurse</span>
        </button>

        <button
          onClick={() => handleRoleSelect('/admin/pharmacist-login')}
          className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105 aspect-square"
        >
          <span className="text-3xl font-semibold">Pharmacist</span>
        </button>
      </div>
    </div>
  );
};

export default Admin;