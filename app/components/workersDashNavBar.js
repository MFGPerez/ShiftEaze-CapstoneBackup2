"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth } from "firebase/auth";
import { firebaseApp } from 'utils/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const WorkersDashNavBar = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [profilePic, setProfilePic] = useState("");
  const [managerId, setManagerId] = useState("");

  useEffect(() => {
    const storedManagerId = localStorage.getItem('managerId');
    if (storedManagerId) {
      setManagerId(storedManagerId);
    }

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

  return (
    <nav className="bg-black opacity-95 text-white py-4 w-full fixed top-0 left-0 z-50">
      <div className="flex justify-between items-center px-5">
        <div className="text-2xl font-rockSalt mr-auto">ShiftEaze!</div>
        <div className="flex space-x-6 items-center">
          <Link href={`/calendar?view=worker&managerId=${managerId}`} className="hover:text-blue-400 text-lg font-comfortaa">Calendar</Link>
          <Link href={`/requestLeave?managerId=${managerId}&firstName=${auth.currentUser?.displayName?.split(' ')[0]}&lastName=${auth.currentUser?.displayName?.split(' ')[1]}`} className="hover:text-blue-400 text-lg font-comfortaa">Request Leave</Link>
          <Link
            href="/signin"
            className="font-comfortaa bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-red-400"
          >
            Logout
          </Link>
          {profilePic && (
            <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default WorkersDashNavBar;
