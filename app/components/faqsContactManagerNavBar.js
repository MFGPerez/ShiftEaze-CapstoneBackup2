"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * SupportNavBar Component
 * 
 * This component renders a navigation bar with a title and a link back to the Worker Search page.
 * It uses the Next.js Link component for client-side navigation.
 * 
 * @returns {JSX.Element} The SupportNavBar component
 */
const SupportNavBar = () => {
  const router = useRouter();

  /**
   * Handles the back button click event.
   * 
   * Navigates the user to the previous page.
   */
  const handleBack = () => {
    router.back();
  };

  return (
    <nav className="bg-black opacity-85 text-white py-3 w-full">
      <div className="flex justify-between items-center px-4">
        <div className="text-xl font-rockSalt">ShiftEaze!</div>
        <div className="flex space-x-6 items-center">
        <button
            onClick={handleBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-md inline-block shadow-md hover:bg-gray-600 border-2 border-transparent hover:border-gray-400 font-comfortaa font-semibold"
          >
            Back to Punch in
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SupportNavBar;






