"use client";
import React from 'react';
import AboutUsNavBar from '@components/aboutUsNavBar';

/**
 * AboutUs Component
 * 
 * This component renders the About Us page for the ShiftEaze application.
 * It includes the AboutUsNavBar component for navigation and displays information about the company.
 * 
 * @returns {JSX.Element} The AboutUs component
 */
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col">
      <AboutUsNavBar />
      <main className="flex flex-col items-center justify-center text-white flex-grow py-20 px-4">
        <h1 className="text-xl font-comfortaa text-center">
          What is <span className="font-rockSalt">ShiftEaze ?</span>
        </h1>
        <div className="w-full max-w-2xl text-center mt-6">
          <img
            src="https://via.placeholder.com/400x300"
            alt="Placeholder"
            className="rounded-lg shadow-lg mb-6 mx-auto"
          />
          <p className="text-lg font-nixie font-semibold leading-relaxed mb-6">
            Welcome to our project, a revolutionary solution for the restaurant and fast food industry. Our team is composed of dedicated 4th semester Information Technology students majoring in software development at SAIT (Southern Alberta Institute of Technology) in Calgary, AB. The team includes Leon Gongola and his sister Loina Gongola, Kevin Nguyen, Anoop Kaur, Sukhman Kaur, and Marcel Gallardo. In 2024, we embarked on this journey to create a product that we are incredibly proud of.
          </p>
          <p className="text-lg font-nixie font-semibold leading-relaxed mb-6">
            Our project leverages the power of Next.js and React for the front end, with Firebase DB handling the back end. This application was born from our collective experiences in the restaurant industry, where we noticed a glaring gap in efficient and user-friendly scheduling and employee management tools. Existing apps were cumbersome, hard to navigate, and visually unappealing. We aimed to change that by developing a web app that empowers managers to create schedules, add workers, view analytics, and track hours seamlessly. Our solution also provides a secure punch-in and punch-out functionality for workers, who can view a universal calendar and see their schedules by job title or department.
          </p>
          <p className="text-lg font-nixie font-semibold leading-relaxed">
            The workflow is designed to be intuitive and flexible. Managers can sign up or log in to create and manage worker schedules. They can set up a tablet in the restaurant for workers to punch in and view their schedules. Alternatively, workers can use the web app to find their manager and punch in directly. All hours worked, including punch-in and punch-out times and breaks, are meticulously recorded for managerial review. With this technology, we strive to bring more organization to the industry and, most importantly, make people's lives a little easier.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;
