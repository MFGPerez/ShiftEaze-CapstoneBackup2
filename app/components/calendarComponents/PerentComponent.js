"use client";
import React, { useState } from 'react';
import ScheduleBlockCreator from '@components/calendarComponents/scheduleBlockCreator';
import CalendarGrid from '@components/calendarComponents/calendarGrid';

/**
 * ParentComponent
 * 
 * This component manages the state and interactions for creating, moving, and deleting schedule blocks within a calendar grid.
 * 
 * @returns {JSX.Element} The parent component containing the ScheduleBlockCreator and CalendarGrid
 */
const ParentComponent = () => {
  const [blocks, setBlocks] = useState([]);
  const [editable, setEditable] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  /**
   * Adds a new block to the calendar grid.
   * @param {Object} newBlock - The new block to add
   */
  const addBlockToGrid = (newBlock) => {
    setBlocks([...blocks, newBlock]);
  };

  /**
   * Toggles the edit mode for the calendar grid.
   */
  const toggleGridEditMode = () => {
    setEditable(!editable);
  };

  /**
   * Moves a block to a new position in the calendar grid.
   * @param {string} id - The unique identifier of the block
   * @param {number} row - The new row position
   * @param {number} col - The new column position
   */
  const moveBlock = (id, row, col) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, row, col } : block
      )
    );
  };

  /**
   * Deletes a block from the calendar grid.
   * @param {string} id - The unique identifier of the block
   */
  const deleteBlock = (id) => {
    console.log(`Deleting block with id: ${id}`); // Debugging log
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
  };

  /**
   * Updates the dates of a block in the calendar grid.
   * @param {string} id - The unique identifier of the block
   * @param {Date} newStartDate - The new start date of the block
   * @param {Date} newEndDate - The new end date of the block
   */
  const updateBlock = (id, newStartDate, newEndDate) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, startDate: newStartDate, endDate: newEndDate } : block
      )
    );
  };

  console.log('deleteBlock function:', deleteBlock); // Debugging log to check deleteBlock function

  return (
    <div>
      <ScheduleBlockCreator addBlockToGrid={addBlockToGrid} toggleGridEditMode={toggleGridEditMode} />
      <CalendarGrid 
        blocks={blocks} 
        selectedDate={selectedDate} 
        editable={editable} 
        moveBlock={moveBlock} 
        deleteBlock={deleteBlock} 
        updateBlock={updateBlock} 
      />
    </div>
  );
};

export default ParentComponent;
