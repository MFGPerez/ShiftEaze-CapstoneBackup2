"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseApp } from 'utils/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const WorkersDashNavBar = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();
  const [profilePic, setProfilePic] = useState("");

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
    <nav className="bg-black opacity-95 text-white py-4 w-full">
      <div className="flex justify-between items-center px-4">
        <div className="text-2xl font-rockSalt mr-auto">ShiftEaze</div>
        <div className="flex space-x-6 items-center">
          <Link href="/calendar?view=worker" className="hover:text-blue-400 text-lg font-comfortaa">Calendar</Link>
          <Link href="/contactManager" className="hover:text-blue-400 text-lg font-comfortaa">Contact Manager</Link>
          {profilePic && (
            <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full" />
          )}
          <button
            onClick={handleLogout}
            className="font-comfortaa font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-red-400"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default WorkersDashNavBar;
