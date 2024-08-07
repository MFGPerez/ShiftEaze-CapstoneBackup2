"use client";
import React, { createContext, useContext, useState } from 'react';

// Create a context for workers
const WorkersContext = createContext();

// Custom hook to use the WorkersContext
export const useWorkers = () => useContext(WorkersContext);

/**
 * WorkersProvider Component
 * 
 * This component provides the workers context to its children.
 * It manages the state of workers and the selected job title.
 * 
 * @param {Object} props - The props object
 * @param {React.ReactNode} props.children - The child components to be wrapped by the WorkersProvider
 * @returns {JSX.Element} The WorkersProvider component wrapping its children with the workers context
 */
export const WorkersProvider = ({ children }) => {
  const [workers, setWorkers] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');

  return (
    <WorkersContext.Provider value={{ workers, setWorkers, selectedJobTitle, setSelectedJobTitle }}>
      {children}
    </WorkersContext.Provider>
  );
};
