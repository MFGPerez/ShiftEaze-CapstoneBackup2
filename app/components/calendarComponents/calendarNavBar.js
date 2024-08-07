"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * CalendarNavBar Component
 * 
 * This component represents a navigation bar for the calendar. It includes a back button to navigate to the previous page and a title.
 * 
 * @returns {JSX.Element} The rendered CalendarNavBar component
 */
const CalendarNavBar = () => {
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
    <nav className="bg-black opacity-95 text-white py-7 relative">
      <div className="container mx-auto flex justify-between items-center px-1">
        <div className="flex items-center absolute inset-y-15 left-2 w-30">
          <button
            onClick={handleBack}
            className="font-comfortaa font-semibold bg-gray-500 text-white px-2 py-2 rounded-md inline-block hover:bg-gray-600 border-2 border-transparent hover:border-gray-400 mr-32"
          >
            Back to Previous Page
          </button>
          <div className="text-xl font-rockSalt  flex inset-y-15 right-40">ShiftEaze</div>
        </div>
      </div>
    </nav>
  );
};

export default CalendarNavBar;
