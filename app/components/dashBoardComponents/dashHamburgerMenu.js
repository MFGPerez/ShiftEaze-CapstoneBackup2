import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

const DashHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button onClick={toggleMenu} className="text-white hover:text-blue-400 text-3xl">
        {isOpen ? <FaTimes className="text-red-700 hover:text-red-500" /> : <FaBars />}
      </button>
      {isOpen && (
        <div className="absolute top-14 -right-4 h-auto w-96 bg-black p-0 z-40 overflow-y-auto rounded-lg shadow-lg">
          <div className="bg-gray-100 text-black text-center p-4 rounded-t-lg w-full">
            <h2 className="text-3xl font-comfortaa font-bold">Quick Access</h2>
          </div>
          <div className="bg-black p-7 rounded-b-lg shadow-lg w-full space-y-6">
            <div>
              <h2 className="text-2xl font-comfortaa font-semibold text-blue-500">Worker Manager</h2>
              <p className="font-nixie text-sm text-white mb-2">
                Add new workers, edit their information, and search for specific workers with ease.
              </p>
              <Link href="/workers">
                <button className="font-comfortaa font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300">
                  Go to Worker Manager
                </button>
              </Link>
            </div>
            <hr className="border-t border-gray-100" />
            <div>
              <h2 className="text-2xl font-comfortaa font-semibold text-blue-500">Calendar Manager</h2>
              <p className="font-nixie text-sm text-white mb-2">
                Efficiently schedule shifts and ensure optimal workforce coverage.
              </p>
              <Link href="/calendar">
                <button className="font-comfortaa font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300">
                  Go to Calendar Manager
                </button>
              </Link>
            </div>
            <hr className="border-t border-gray-100" />
            <div>
              <h2 className="text-2xl font-comfortaa font-semibold text-blue-500">Worker History</h2>
              <p className="font-nixie text-sm text-white mb-2">
                View detailed work history and adjust working hours for better management.
              </p>
              <Link href="/trackworkhistory">
                <button className="font-comfortaa font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300">
                  Go to Worker History
                </button>
              </Link>
            </div>
            <hr className="border-t border-gray-100" />
            <div>
              <h2 className="text-2xl font-comfortaa font-semibold text-blue-500">Workforce Analytics</h2>
              <p className="font-nixie  text-sm text-white mb-2">
                Get insights into workforce performance with comprehensive analytics.
              </p>
              <Link href="/analytics">
                <button className="font-comfortaa font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300">
                  Go to Workforce Analytics
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashHamburgerMenu;
