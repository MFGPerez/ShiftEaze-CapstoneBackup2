/**
 * Component: TestPage
 * Description: This component represents a test page layout with various components rendered.
 *              It includes a welcome message with the current date and time,
 *              a horizontal calendar, and schedule blocks for full day, off day, and vacation day.
 * Props: None
 */
import React from "react";
import DisplayDate from "@/components/displayDate";
import DisplayTime from "@/components/displayTime";


const TestPage = () => {
  // Render the test page layout
  return (
    <div className="mainpage min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800">
      {/* Welcome message with current date and time */}
      <div className="welcome-msg text-white py-7">
        <DisplayDate />
        <DisplayTime />
      </div>

      {/* Minimal burger menu */}
   

      {/* Other components and content */}
      <div className="content">
        {/* Add other content here */}
      </div>
    </div>
  );
};

export default TestPage;
