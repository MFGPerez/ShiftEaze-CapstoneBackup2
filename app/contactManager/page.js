"use client";

import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { firebaseApp } from "../../utils/firebase";
import SupportNavBar from "@components/faqsContactManagerNavBar";

/**
 * WorkerSupport Component
 * 
 * This component provides a form for workers to contact their manager for support. It handles form submission,
 * sends the support message to Firestore, and provides feedback to the user.
 * 
 * @returns {JSX.Element} The WorkerSupport component
 */
const WorkerSupport = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Capitalize the first and last name
   * 
   * @param {string} fullName - The full name of the user
   * @returns {string} The formatted full name
   */
  const capitalizeName = (fullName) => {
    return fullName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  /**
   * Format the timestamp
   * 
   * @param {Date} date - The date to format
   * @returns {Object} An object containing formatted date and time
   */
  const formatTimestamp = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString("en-US", options);
    const formattedTime = date.toLocaleTimeString("en-US", options);

    return {
      formattedDate,
      formattedTime,
    };
  };

  /**
   * Handles the form submission to send a support message
   * 
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    const formattedName = capitalizeName(name);
    const timestamp = Timestamp.now();
    const { formattedDate, formattedTime } = formatTimestamp(new Date());

    try {
      const supportMessage = {
        name: formattedName,
        email,
        message,
        timestamp,
        date: formattedDate,
        time: formattedTime,
      };

      await addDoc(collection(db, "managers", user.uid, "supportMessages"), supportMessage);

      setStatus("Message sent successfully.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("Error sending message: " + error.message);
    }
  };

  return (
    <>
      <SupportNavBar />
      <main className="flex min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex-col items-center justify-between pt-15">
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <h1 className="font-comfortaa font-bold text-6xl text-white mb-8">Support</h1>
          <div className="bg-black opacity-85 rounded-lg shadow-md p-8 max-w-3xl w-full">
            <h2 className="text-2xl font-comfortaa font-bold text-white mb-4">Contact Your Manager</h2>
            <p className="text-white font-comfortaa font-semibold mb-6">
              If you have any questions or need assistance, please fill out the form below, and your manager will get back to you as soon as possible.
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-comfortaa font-semibold text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-black mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-nixie"
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-comfortaa font-semibold text-white">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-black mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-nixie"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-comfortaa font-semibold text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-black mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-nixie"
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-3 px-6 transition-colors border-2 border-transparent hover:border-blue-300 font-comfortaa font-semibold"
                >
                  Send
                </button>
              </div>
            </form>
            {status && <p className="text-white mt-4">{status}</p>}
          </div>
        </div>
      </main>
    </>
  );
};

export default WorkerSupport;
