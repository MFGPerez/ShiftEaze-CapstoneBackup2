// NavBarDashboard.js
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseApp } from 'utils/firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import DashHamburgerMenu from './dashHamburgerMenu';

const db = getFirestore(firebaseApp);

const NavBarDashboard = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const [profilePic, setProfilePic] = useState("");
  const [managerName, setManagerName] = useState("");

  useEffect(() => {
    const fetchUserProfilePic = () => {
      const user = auth.currentUser;
      if (user) {
        setProfilePic(user.photoURL);
        const managerDocRef = doc(db, "managers", user.uid);
        getDoc(managerDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            setManagerName(docSnap.data().displayName);
          }
        });
      }
    };

    fetchUserProfilePic();
  }, [auth]);

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
    <nav className="bg-black opacity-95 text-white py-4 relative z-10">
      <div className="flex justify-between items-center px-4">
        <div className="text-2xl font-rockSalt flex-grow text-left">ShiftEaze!</div>
        <div className="flex items-center space-x-6">
          <span className="text-xl font-comfortaa font-semibold">Welcome back!</span>
          <span className="mx-2 font-bold">|</span>
          <Link href="/dashboard" className="hover:text-blue-400 text-lg font-comfortaa">Home</Link>
          <Link href="/workers" className="hover:text-blue-400 text-lg font-comfortaa">Workers</Link>
          <Link href="/calendar?view=admin" className="hover:text-blue-400 text-lg font-comfortaa">Calendar</Link>
          <span className="mx-2"></span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="mx-2 font-bold">|</span>
          {profilePic && (
            <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full" />
          )}
          <button
            onClick={handleLogout}
            className=" font-comfortaa bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-red-400"
          >
            Logout
          </button>
          <DashHamburgerMenu/>
        </div>
      </div>
    </nav>
  );
};

export default NavBarDashboard;
