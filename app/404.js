"use client";

import React from 'react';
import { useRouter } from 'next/router';
import { FaHome } from 'react-icons/fa';

/**
 * NotFoundPage component displays a 404 error page with an option to navigate back to the homepage
 */
const NotFoundPage = () => {
  const router = useRouter();

  /**
   * Handles navigation to the homepage
   */
  const handleGoHome = () => {
    router.push('/signin');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="max-w-md p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-lg mb-8">
          Oops! The page you are looking for does not exist.
        </p>
        <button
          onClick={handleGoHome}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <FaHome className="mr-2" />
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
