"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseApp } from 'utils/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * PageNavBar Component
 * 
 * This component renders the navigation bar for the ShiftEaze application.
 * It includes navigation links to different sections of the app and displays the user's profile picture.
 * It also provides a logout button for the user to sign out of the application.
 * 
 * @returns {JSX.Element} The PageNavBar component
 */
const PageNavBar = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [profilePic, setProfilePic] = useState("");

  /**
   * Fetches the user's profile picture from Firestore.
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
   * Handles user logout and redirects to the sign-in page.
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
        <div className="text-2xl font-rockSalt mr-auto">ShiftEaze</div>
        <div className="flex space-x-6 items-center">
          <Link href="/dashboard" className="hover:text-blue-400 text-lg font-comfortaa">Home</Link>
          <Link href="/workers" className="hover:text-blue-400 text-lg font-comfortaa">Workers</Link>
          <Link href="/calendar" className="hover:text-blue-400 text-lg font-comfortaa">Calendar</Link>
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

export default PageNavBar;
