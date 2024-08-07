"use client";
import React from 'react';
import { useWorkers } from './workersContext';

/**
 * WorkersDisplay Component
 * 
 * This component displays a list of workers. It limits the number of displayed workers to a maximum of 14.
 * Each worker is shown with a checkbox, profile picture, name, and email.
 * 
 * @returns {JSX.Element} The WorkersDisplay component
 */
const WorkersDisplay = () => {
  const { workers } = useWorkers();

  // Limit the workers displayed to a maximum of 14
  const displayedWorkers = workers.slice(0, 14);

  return (
    <div className="flex flex-col bg-white shadow-md border border-gray-300 w-[300px] h-[1454px] overflow-y-auto">
      <div className="h-[252px] flex items-center justify-center border-b border-gray-300">
        <h1 className="text-xl font-comfortaa font-bold text-black pb-4">Workers</h1>
      </div>
      {displayedWorkers.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No workers selected</div>
      ) : (
        displayedWorkers.map((worker, index) => (
          <React.Fragment key={worker.id}>
            {index === 7 && (
              <div className="border-b border-gray-300 h-[80px]"></div>
            )}
            <div className="flex items-center border-b border-gray-300 h-[80px] p-2">
              <img src={worker.profilePic} alt={`${worker.firstName} ${worker.lastName}`} className="w-10 h-10 rounded-full mr-2" />
              <div className="flex flex-col">
                <span className="font-comfortaa font-bold text-sm font-semibold text-black">{worker.firstName} {worker.lastName}</span>
                <span className="font-nixie font-semibold text-xs text-black">{worker.email}</span>
              </div>
            </div>
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default WorkersDisplay;
