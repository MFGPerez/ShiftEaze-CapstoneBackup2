"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseApp } from 'utils/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * AnalyticsNavBar Component
 * 
 * This component renders a navigation bar for the analytics section of the site.
 * It includes links to various pages and handles user authentication for displaying profile picture and logout functionality.
 * 
 * @returns {JSX.Element} The AnalyticsNavBar component
 */
const AnalyticsNavBar = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [profilePic, setProfilePic] = useState("");

  /**
   * Fetches the profile picture URL of the current authenticated user from Firestore.
   */
  useEffect(() => {
    const fetchUserProfilePic = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfilePic(userData.photoURL);
        }
      }
    };

    fetchUserProfilePic();
  }, [auth, db]);

  /**
   * Handles the logout process, signing out the user and redirecting to the signin page.
   */
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/signin");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <nav className="bg-black opacity-85 text-white py-4 w-full">
      <div className="flex justify-between items-center px-4">
        <div className="text-xl font-rockSalt">ShiftEaze</div>
        <div className="flex space-x-6 items-center">
          <Link href="/dashboard" className="hover:text-blue-400 text-lg font-comfortaa">Home</Link>
          <Link href="/workers" className="hover:text-blue-400 text-lg font-comfortaa">Workers</Link>
          <Link href="/calendar" className="hover:text-blue-400 text-lg font-comfortaa">Calendar</Link>
          <Link href="/workersDashboard" className="hover:text-blue-400 text-lg font-comfortaa">Workers Dashboard</Link>
          {profilePic && (
            <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full" />
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-red-400 font-comfortaa font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AnalyticsNavBar;
