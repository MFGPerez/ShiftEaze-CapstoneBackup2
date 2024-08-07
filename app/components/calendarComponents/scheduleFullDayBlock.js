"use client";
import React, { useState, useEffect } from 'react';
import { MdOutlineEdit, MdDeleteOutline } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import { HiOutlineChevronDoubleRight } from 'react-icons/hi';
import { format, parseISO, parse, differenceInDays, getMonth, endOfMonth } from 'date-fns';
import { useDrag, useDrop } from 'react-dnd';

/**
 * ScheduleFullDayBlock Component
 * 
 * This component represents a full day schedule block with drag-and-drop functionality.
 * It displays details about the schedule block and allows editing and deleting the block.
 * 
 * @param {Object} props - The component props
 * @param {string} props.id - The unique identifier for the block
 * @param {Date} props.startDate - The start date of the block
 * @param {Date} props.endDate - The end date of the block
 * @param {string} props.startTime - The start time of the block
 * @param {string} props.endTime - The end time of the block
 * @param {Function} props.setStartDate - Function to set the start date
 * @param {Function} props.setEndDate - Function to set the end date
 * @param {Function} props.onDelete - Function to delete the block
 * @param {Function} props.moveBlock - Function to move the block
 * @param {number} props.row - The row position of the block
 * @param {number} props.col - The column position of the block
 * @param {Function} props.updateBlock - Function to update the block
 * @param {Object} props.employee - The employee associated with the block
 * @param {string} props.mode - The current mode ('admin' or 'worker')
 * @returns {JSX.Element} The ScheduleFullDayBlock component
 */
const ScheduleFullDayBlock = ({
  id,
  startDate: initialStartDate,
  endDate: initialEndDate,
  startTime,
  endTime,
  setStartDate,
  setEndDate,
  onDelete,
  moveBlock,
  row,
  col,
  updateBlock,
  employee,
  mode
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDateState] = useState(new Date(initialStartDate));
  const [endDate, setEndDateState] = useState(new Date(initialEndDate));

  useEffect(() => {
    setStartDateState(new Date(initialStartDate));
    setEndDateState(new Date(initialEndDate));
  }, [initialStartDate, initialEndDate]);

  const handleButtonClick = () => {
    setIsPopupOpen(!isPopupOpen);
    setIsEditing(false);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDoneClick = () => {
    setIsEditing(false);
    if (typeof updateBlock === 'function') {
      updateBlock(id, startDate, endDate);
    }
  };

  const formatDate = (date) => format(date, 'd, MMMM, yyyy');

  const formatTime = (time) => {
    try {
      return time ? format(parse(time, 'HH:mm', new Date()), 'h:mm a') : '';
    } catch (error) {
      return '';
    }
  };

  const calculateWidth = () => {
    const minDays = 1; // Minimum of 1 day
    const maxDays = differenceInDays(endOfMonth(startDate), startDate) + 1;
    let days = differenceInDays(endDate, startDate) + 1;

    const adjustedDays = Math.min(days, maxDays);
    return `${adjustedDays * 80}px`; // Each day is represented by 80px
  };

  const isMultiMonth = getMonth(startDate) !== getMonth(endDate);

  const [{ isDragging }, drag] = useDrag({
    type: 'BLOCK',
    item: { id, type: 'BLOCK', startCol: col, row },
    canDrag: mode === 'admin', // Only draggable in admin mode
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BLOCK',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      const newCol = Math.round(item.startCol + delta.x / 80);
      const newRow = Math.round(item.row + delta.y / 80);

      if (newCol >= 0 && newCol < 31 && newRow >= 0 && newRow < 14) {
        moveBlock(item.id, newRow, newCol);
      }
    },
  });

  const animateBlock = (start, end, setBlockState) => {
    let startDate = new Date(start);
    const endDate = new Date(end);
    const interval = setInterval(() => {
      if (startDate < endDate) {
        startDate.setDate(startDate.getDate() + 1);
      } else if (startDate > endDate) {
        startDate.setDate(startDate.getDate() - 1);
      }
      setBlockState(new Date(startDate));
      if (startDate.getTime() === endDate.getTime()) {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleStartDateChange = (newStartDate) => {
    animateBlock(startDate, newStartDate, setStartDateState);
    moveBlock(id, row, newStartDate.getDate() - 1);
  };

  const handleEndDateChange = (newEndDate) => {
    animateBlock(endDate, newEndDate, setEndDateState);
  };

  return (
    <div ref={(node) => drag(drop(node))} className="relative" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <button
        onClick={handleButtonClick}
        className="inline-block px-4 py-2 cursor-pointer relative outline-none rounded-lg text-lg h-[80px] flex flex-col items-start justify-center pl-4 transition-all"
        style={{
          backgroundColor: 'rgba(34, 139, 34, 0.5)', // Darker translucent green
          border: '2px solid rgba(34, 139, 34, 0.8)', // Darker green border
          width: calculateWidth(),
          color: 'rgba(34, 139, 34, 0.85)', // Slightly darker text
          fontWeight: 'bold', // Make text bold
        }}
      >
        <span className="block">Full Day</span>
        <span className="block text-xs">Time: {formatTime(startTime)} - {formatTime(endTime)}</span>
        {employee && (
          <div className="flex items-center mt-1">
            <img src={employee.photoURL} alt="profile" className="w-6 h-6 rounded-full mr-2" />
            <span className="text-xs">{employee.firstName} {employee.lastName}</span>
          </div>
        )}
        {isMultiMonth && (
          <span className="absolute right-0 flex items-center h-full pr-2">
            <HiOutlineChevronDoubleRight className="text-green-600 text-3xl" />
          </span>
        )}
      </button>

      {isPopupOpen && (
        <div className="absolute text-black left-0 top-[60px] w-[280px] bg-white border border-white p-4 shadow-md z-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-xl text-black">Full Work Day <span className="inline-block w-3 h-3 rounded-full bg-green-600 ml-2"></span></div>
              <div className="text-black mt-1">Time: {formatTime(startTime)} - {endTime && format(parse(endTime, 'HH:mm', new Date()), 'h:mm a')}</div>
            </div>
            <div className="flex space-x-2">
              {mode === 'admin' && (
                <>
                  <button onClick={handleEditClick} className="text-black hover:text-blue-600">
                    <MdOutlineEdit />
                  </button>
                  <button onClick={onDelete} className="text-black hover:text-blue-600">
                    <MdDeleteOutline />
                  </button>
                </>
              )}
              <button onClick={handleClosePopup} className="text-black hover:text-blue-600">
                <AiOutlineClose />
              </button>
            </div>
          </div>

          {isEditing && (
            <div className="mt-4">
              <div className="mb-2">
                <label className="block text-black font-bold mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-black rounded-lg"
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleStartDateChange(parseISO(e.target.value))}
                />
              </div>
              <div className="mb-2">
                <label className="block text-black font-bold mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-black rounded-lg"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleEndDateChange(parseISO(e.target.value))}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleDoneClick}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-900"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {!isEditing && (
            <>
              <div className="mt-4 text-black font-bold">Shift Dates:</div>
              <div className="text-black">
                {startDate ? formatDate(startDate) : 'Not set'} - {endDate ? formatDate(endDate) : 'Not set'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleFullDayBlock;
