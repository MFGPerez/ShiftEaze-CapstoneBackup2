"use client";
import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * ClientSideDndProvider Component
 * 
 * This component wraps its children with a DndProvider to enable drag-and-drop functionality.
 * It ensures that the DndProvider is only rendered on the client side to prevent issues during server-side rendering.
 * 
 * @param {Object} props - The props object
 * @param {React.ReactNode} props.children - The child components to be wrapped by the DndProvider
 * @returns {JSX.Element|null} The DndProvider wrapping the children, or null if not yet rendered on the client side
 */
const ClientSideDndProvider = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  /**
   * useEffect hook to set the client-side flag
   * 
   * This hook sets the isClient state to true once the component is mounted,
   * ensuring that the DndProvider is only rendered on the client side.
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render nothing if not on the client side
  if (!isClient) {
    return null;
  }

  // Render the DndProvider with HTML5Backend and wrap the children
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
};

export default ClientSideDndProvider;
