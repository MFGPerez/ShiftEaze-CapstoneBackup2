"use client";
import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { format } from 'date-fns';
import ScheduleFullDayBlock from './scheduleFullDayBlock';
import ScheduleOffDayBlock from './scheduleOffDayBlock';
import ScheduleVacationDayBlock from './scheduleVacationDayBlock';

/**
 * CalendarGrid Component
 * 
 * This component renders a calendar grid that allows for drag-and-drop scheduling of various types of blocks.
 * It supports full day, off day, and vacation day blocks. The component handles the interaction and updates
 * to these blocks within the grid.
 * 
 * @param {Object} props - The component props
 * @param {Array} props.blocks - The array of schedule blocks to display
 * @param {Date|null} props.selectedDate - The currently selected date
 * @param {Object} props.topGridRef - A ref object for the top grid element to sync scrolling
 * @param {Function} props.moveBlock - Function to move a block within the grid
 * @param {Function} props.deleteBlock - Function to delete a block from the grid
 * @param {Function} props.updateBlock - Function to update a block's details
 * @param {String} props.mode - The mode of the calendar (e.g., 'worker' mode disables drag-and-drop)
 * 
 * @returns {JSX.Element} The rendered CalendarGrid component
 */
const CalendarGrid = ({ blocks, selectedDate, topGridRef, moveBlock, deleteBlock, updateBlock, mode }) => {
  const bottomGridRef = useRef(null);

  /**
   * Synchronize scrolling between top and bottom grids
   */
  const handleBottomScroll = () => {
    if (bottomGridRef.current && topGridRef.current) {
      const scrollLeft = bottomGridRef.current.scrollLeft;
      topGridRef.current.scrollTo({ left: scrollLeft });
    }
  };

  useEffect(() => {
    if (bottomGridRef.current) {
      bottomGridRef.current.addEventListener('scroll', handleBottomScroll);
    }
    return () => {
      if (bottomGridRef.current) {
        bottomGridRef.current.removeEventListener('scroll', handleBottomScroll);
      }
    };
  }, [bottomGridRef, topGridRef]);

  // Generate an array of dates for a month (assuming a 31-day month)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => new Date(2023, 0, i + 1));

  const [, drop] = useDrop({
    accept: 'BLOCK',
    drop: (item, monitor) => {
      if (mode === 'worker') return;

      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      const newCol = Math.round(item.startCol + delta.x / 80);
      const newRow = Math.round(item.row + delta.y / 80);

      if (newCol >= 0 && newCol < 31 && newRow >= 0 && newRow < 14) {
        moveBlock(item.id, newRow, newCol);
      }
    },
  });

  /**
   * Render the grid cells
   * 
   * @param {number} startRow - The starting row index
   * @param {number} endRow - The ending row index
   * @returns {JSX.Element} The grid cells for the specified row range
   */
  const renderGrid = (startRow, endRow) => (
    <div className="grid grid-cols-[repeat(31,80px)] gap-0 bg-white relative">
      {Array.from({ length: 31 }, (_, col) => (
        <React.Fragment key={col}>
          {Array.from({ length: endRow - startRow }, (_, row) => (
            <div
              key={row}
              className={`bg-[#f9f9f9] border border-gray-300 w-[80px] h-[80px] flex flex-col justify-center items-center box-border ${
                (row + startRow + 1) % 7 === 0 ? 'bg-[#828282] text-black' : 'text-black'
              }`}
            ></div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );

  /**
   * Render the schedule blocks
   * 
   * @param {Array} blocks - The array of schedule blocks to render
   * @returns {Array<JSX.Element>} The rendered schedule blocks
   */
  const renderBlocks = (blocks) => blocks.map((block) => {
    const startCol = new Date(block.startDate).getDate() - 1;
    const endCol = new Date(block.endDate).getDate() - 1;
    const row = block.row;

    const BlockComponent = block.type === 'Full Day Block'
      ? ScheduleFullDayBlock
      : block.type === 'Off Day Block'
        ? ScheduleOffDayBlock
        : ScheduleVacationDayBlock;

    return (
      <div
        key={block.id}
        className="absolute"
        style={{
          top: `${row * 80}px`,
          left: `${startCol * 80}px`,
          width: `${(endCol - startCol + 1) * 80}px`,
          height: '80px',
        }}
      >
        <BlockComponent
          id={block.id}
          startDate={new Date(block.startDate)}
          endDate={new Date(block.endDate)}
          startTime={block.startTime}
          endTime={block.endTime}
          setStartDate={(date) => moveBlock(block.id, row, date.getDate() - 1)}
          setEndDate={(date) => moveBlock(block.id, row, date.getDate() - 1)}
          onDelete={() => deleteBlock(block.id)}
          row={row}
          col={startCol}
          moveBlock={moveBlock}
          updateBlock={updateBlock}
          employee={block.employee}
          mode={mode}
        />
      </div>
    );
  });

  return (
    <div ref={drop} className="flex flex-col w-full max-w-[1500px] border border-gray-300 overflow-hidden bg-gray-200 mb-5 mx-auto relative">
      <div ref={bottomGridRef} className="overflow-x-auto">
        <div className="relative">
          {renderGrid(0, 7)}
          <div className="h-20 w-full bg-gray-200"></div>
          {renderGrid(7, 14)}
          {renderBlocks(blocks)}
        </div>
        {selectedDate && (
          <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: `${daysInMonth.findIndex((date) => format(date, 'yyyy-MM-dd') === format(selectedDate, "yyyy-MM-dd")) * 80 + 40}px` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarGrid;