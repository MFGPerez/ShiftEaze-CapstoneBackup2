"use client";

import React, { useState, useEffect } from 'react';

/**
 * DisplayTime Component
 * 
 * This component displays the current time, updating every second.
 * It uses a useEffect hook to set and update the current time.
 * 
 * @returns {JSX.Element} The DisplayTime component
 */
const DisplayTime = () => {
  const [currentTime, setCurrentTime] = useState('');

  /**
   * useEffect hook to set and update the current time
   * 
   * This hook sets the currentTime state to the current time string
   * when the component mounts and updates it every second.
   */
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setCurrentTime(timeString);
    };

    // Update the time every second
    const intervalId = setInterval(updateCurrentTime, 1000);

    // Set the initial time
    updateCurrentTime();

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <p>The Time is: {currentTime}</p>
    </div>
  );
};

export default DisplayTime;
