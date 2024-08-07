"use client";

import React, { useState } from 'react';
import NavBarFAQ from '@/components/FAQComponents/navBarFAQ';
import FAQItem from '@/components/FAQComponents/FAQItem';
import Search from '@/components/FAQComponents/FAQSearch';

/**
 * FAQ data containing questions and answers
 */
const faqs = [
  { question: 'How do I sign in?', answer: 'Look for the sign-in button on the start screen. If you do not have an account, look for “Sign up here” at the bottom of the button.' },
  { question: 'How do I reset my password?', answer: 'Click on the “Forgot Password” link on the sign-in page and follow the instructions.' },
  { question: 'How do I update my profile?', answer: 'Navigate to the profile section in your dashboard and click on “Edit Profile”.' },
  { question: 'How do I contact support?', answer: 'You can contact support via the “Support” link in the navigation bar.' },
  { question: 'How do I delete my account?', answer: 'To delete your account, please contact support.' },
];

/**
 * FAQs Component
 * 
 * This component displays a list of Frequently Asked Questions (FAQs).
 * It includes a search functionality to filter FAQs based on user input.
 * 
 * @returns {JSX.Element} The FAQs component
 */
const FAQs = () => {
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  /**
   * Handles the search functionality to filter FAQs
   * 
   * @param {string} query - The search query entered by the user
   */
  const handleSearch = (query) => {
    if (!query) {
      setFilteredFaqs(faqs);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const result = faqs.filter(faq =>
      faq.question.toLowerCase().includes(lowercasedQuery) ||
      faq.answer.toLowerCase().includes(lowercasedQuery)
    );

    if (result.length > 0) {
      setFilteredFaqs(result);
    } else {
      setFilteredFaqs([{ question: 'Sorry, nothing matches your search.', answer: '' }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 items-center justify-between">
      <NavBarFAQ />
      <div className="container mx-auto pt-40 px-4"> {/* Increased padding-top to move content down */}
        <div className="flex justify-end mb-4">
          <Search onSearch={handleSearch} />
        </div>
        <div className="bg-black opacity-85 rounded-lg p-6">
          {filteredFaqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;
