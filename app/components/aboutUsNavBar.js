"use client";

import React from 'react';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';

/**
 * AboutUsNavBar Component
 * 
 * This component renders a navigation bar for the About Us section of the site.
 * It includes links to support, FAQs, and about us pages, as well as social media icons.
 * 
 * @returns {JSX.Element} The AboutUsNavBar component
 */
const AboutUsNavBar = () => {
  return (
    <nav className="bg-black opacity-85 text-white py-4 relative z-10">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-2xl font-rockSalt flex-grow text-left">ShiftEaze!</div>
        <div className="flex space-x-6 items-center">
          <Link href="/supportPage" className="hover:text-blue-400 text-lg font-comfortaa">Support</Link>
          <Link href="/FAQs" className="hover:text-blue-400 text-lg font-comfortaa">FAQs</Link>
          <Link href="/aboutUs" className="hover:text-blue-400 text-lg font-comfortaa">About Us</Link>
          <span>|</span>
          <div className="flex space-x-4">
            <a href="https://instagram.com" target="_blank" className="hover:text-blue-400" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" className="hover:text-blue-400" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" className="hover:text-blue-400" rel="noopener noreferrer">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AboutUsNavBar;
