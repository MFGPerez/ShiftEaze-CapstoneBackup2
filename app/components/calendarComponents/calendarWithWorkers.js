"use client";
import React from 'react';
import ScheduleBlockCreator from './scheduleBlockCreator';
import WorkersDisplay from './workersDisplay';
import { WorkersProvider } from './workersContext';
import HorizontalCalendar from './horizontalCalendar';

/**
 * CalendarWithWorkers Component
 * 
 * This component combines the WorkersDisplay, HorizontalCalendar, and ScheduleBlockCreator components within the WorkersProvider context.
 * 
 * @returns {JSX.Element} The rendered CalendarWithWorkers component
 */
const CalendarWithWorkers = () => {
  return (
    <WorkersProvider>
      <div className="flex">
        <WorkersDisplay />
        <div className="flex-grow">
          <HorizontalCalendar />
          <ScheduleBlockCreator />
        </div>
      </div>
    </WorkersProvider>
  );
};

export default CalendarWithWorkers;
