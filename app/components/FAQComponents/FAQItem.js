import React, { useState } from 'react';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';

/**
 * FAQItem Component
 * 
 * This component represents an individual FAQ item. It displays a question and, when clicked, toggles the visibility
 * of the answer. It maintains its own state to track whether the answer is currently visible.
 * 
 * @param {Object} props - The props object
 * @param {string} props.question - The FAQ question to be displayed
 * @param {string} props.answer - The FAQ answer to be displayed when the question is clicked
 * @returns {JSX.Element} The FAQItem component
 */
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * toggleOpen function
   * 
   * This function toggles the state of the FAQ item between open and closed.
   */
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border-b border-gray-300">
      <button
        className="w-full text-left py-4 flex justify-between items-center"
        onClick={toggleOpen}
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        {isOpen ? <AiOutlineUp className="text-white" /> : <AiOutlineDown className="text-white" />}
      </button>
      {isOpen && (
        <div className="py-2 text-white">
          {answer}
        </div>
      )}
    </div>
  );
};

export default FAQItem;
