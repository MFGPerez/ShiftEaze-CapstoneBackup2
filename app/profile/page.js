"use client";
import React, { useState, useEffect } from "react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { firebaseApp } from "../../utils/firebase";
import Link from "next/link";

const Profile = () => {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/signin");
        return;
      }

      setUser(user);
      setEmail(user.email);
      setDisplayName(user.displayName);

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(userData.email || "");
          setDisplayName(userData.displayName || "");
        }
      } catch (error) {
        setError("Error fetching user data: " + error.message);
      }
    };

    fetchUserData();
  }, [auth, db, router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (newPassword) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        email,
        displayName,
      });

      await user.updateEmail(email);
      await user.updateProfile({ displayName });

      setSuccess("Profile updated successfully.");
    } catch (error) {
      setError("Error updating profile: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col justify-center items-center text-white">
      <div className="bg-black opacity-90 p-6 rounded-lg shadow-lg w-full max-w-md mt-10">
        <h1 className="text-4xl mb-8 text-center font-comfortaa font-bold">Profile</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-gray-300 font-comfortaa font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-black border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-nixie"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-comfortaa font-semibold">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-black border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-nixie"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-comfortaa font-semibold">Current Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-black border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-nixie"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-comfortaa font-semibold">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-black border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-nixie"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-comfortaa font-semibold">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-black border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-nixie"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full transition-colors border-2 border-transparent hover:border-blue-400 font-comfortaa font-semibold"
          >
            Update Profile
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link className="text-blue-400 hover:underline" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
