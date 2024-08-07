"use client";

import React, { useState, useEffect } from 'react';

/**
 * DisplayDate Component
 * 
 * This component displays the current date in a human-readable format.
 * It uses a useEffect hook to set the current date when the component mounts.
 * 
 * @returns {JSX.Element} The DisplayDate component
 */
const DisplayDate = () => {
  const [currentDate, setCurrentDate] = useState('');

  /**
   * useEffect hook to set the current date
   * 
   * This hook sets the currentDate state to the current date string
   * when the component mounts.
   */
  useEffect(() => {
    const today = new Date();
    const dateString = today.toDateString();
    setCurrentDate(dateString);
  }, []);

  return (
    <div>
      <p>It is, {currentDate}</p>
    </div>
  );
};

export default DisplayDate;
