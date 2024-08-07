"use client";

import React from "react";
import Link from 'next/link';

/**
 * Footer Component
 * 
 * This component renders the footer section of the website, providing various links and information about the company.
 * 
 * @returns {JSX.Element} The Footer component
 */
const Footer = () => {
  return (
    <footer className="bg-black opacity-85 text-white py-8 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-start">
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 mb-6 lg:mb-0">
            <h2 className="text-xl font-bold">SHIFTEAZE</h2>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 mb-6 lg:mb-0">
            <h3 className="text-lg font-semibold">COMPANY</h3>
            <ul>
              <li><Link href="/aboutUs" className="hover:text-blue-400">About</Link></li>
              <li>Jobs</li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 mb-6 lg:mb-0">
            <h3 className="text-lg font-semibold">CONTACT US</h3>
            <ul>
              <li>Email: ShiftEaze@gmail.com</li>
              <li>Phone: 403-236-7851</li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 mb-6 lg:mb-0">
            <h3 className="text-lg font-semibold">PRIVACY/SECURITY</h3>
            <ul>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 mb-6 lg:mb-0">
            <h3 className="text-lg font-semibold">COMMUNITIES</h3>
            <ul>
              <li>Developers</li>
              <li>Advertising</li>
              <li>Investors</li>
              <li>Vendors</li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 mb-6 lg:mb-0">
            <h3 className="text-lg font-semibold">USEFUL LINKS</h3>
            <ul>
              <li><Link href="/supportPage" className="hover:text-blue-400">Support</Link></li>
              <li>Web Player</li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6 mb-6 lg:mb-0">
            <h3 className="text-lg font-semibold">SHIFTEAZE PLANS</h3>
            <ul>
              <li>Premium Individual</li>
              <li>Premium Duo</li>
              <li>Premium Company</li>
              <li>ShiftEaze Free</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm">&copy; 2024 ShiftEaze. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
