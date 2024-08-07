import React, { useState } from 'react';

/**
 * Search Component
 * 
 * This component provides a search input and a button for triggering a search action.
 * It maintains its own state to track the current query entered by the user.
 * 
 * @param {Object} props - The props object
 * @param {function} props.onSearch - The function to call when the search button is clicked, passing the current query
 * @returns {JSX.Element} The Search component
 */
const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  /**
   * handleSearch function
   * 
   * This function triggers the search action by calling the onSearch function passed via props with the current query.
   */
  const handleSearch = () => {
    onSearch(query);
  };

  /**
   * handleKeyPress function
   * 
   * This function listens for the Enter key press to trigger the search action.
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="p-2 rounded-l-lg text-black focus:outline-none"
        placeholder="Search FAQs"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 hover:bg-blue-600 text-white transition-colors border-2 border-transparent hover:border-blue-300 rounded-r-lg px-4 py-2"
      >
        Search
      </button>
    </div>
  );
};

export default Search;
