"use client";

import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import { firebaseApp } from "../../utils/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/navBarLogin";
import Footer from "@/components/footer";
import DOMPurify from 'dompurify';

// Initialize Firestore
const db = getFirestore(firebaseApp);

const Signup = () => {
  // State variables
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const router = useRouter();

  // Handle Email Sign-Up
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const auth = getAuth(firebaseApp);
    try {
      // Sanitize inputs
      const sanitizedEmail = DOMPurify.sanitize(email);
      const sanitizedPassword = DOMPurify.sanitize(password);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizedEmail,
        sanitizedPassword
      );
      const user = userCredential.user;
      await sendEmailVerification(user);
      setConfirmationMessage(
        "Verification email sent. Please check your inbox and verify your email before logging in."
      );

      const userDocRef = doc(db, "managers", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
      });

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error during email sign-up:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please use a different email.");
      } else {
        setError("Error signing up, please try again.");
      }
    }
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <NavBar />
      <main className="flex min-h-screen bg-gradient-to-r from-blue-500 via-blue-700 to-blue-500 items-center justify-between">
        <div className="w-6/12 h-screen flex flex-col justify-center items-center">
          <h1 className="text-6xl text-white mb-6 font-rockSalt">ShiftEaze</h1>
          <p className="text-white text-lg font-nixie mb-4 text-center">
            Efficient scheduling and management for better productivity.
          </p>
        </div>
        <div className="w-6/12 h-screen flex flex-col justify-center items-center bg-white bg-opacity-20 p-8 rounded-lg shadow-lg">
          <h2 className="text-white text-4xl font-comfortaa font-bold mb-8">Sign Up</h2>
          <form
            onSubmit={handleEmailSignup}
            className="flex flex-col items-center w-full max-w-xs"
          >
            <div className="mb-4 w-full">
              <label className="block text-white font-comfortaa font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))}
                className={`w-full px-4 py-2 rounded-md text-black focus:outline-none font-nixie ${
                  error ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700" : ""
                }`}
                required
                placeholder="yourEmail12@gmail.com"
              />
            </div>
            <div className="mb-6 w-full">
              <label className="block text-white font-comfortaa font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))}
                  className={`w-full px-4 py-2 rounded-md text-black focus:outline-none font-nixie ${
                    error ? "border-red-500 bg-red-50 text-red-900 placeholder-red-700" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && (
              <p
                className="mt-2 text-sm text-red-600 dark:text-red-500"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(error) }}
              ></p>
            )}
            <button
              type="submit"
              className="bg-blue-700 text-white rounded-md py-3 px-6 mb-4 w-full transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 border-2 border-transparent hover:border-blue-400 font-comfortaa font-semibold"
            >
              Sign up with Email
            </button>
          </form>
          {confirmationMessage && (
            <p
              className="text-green-500 mb-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(confirmationMessage) }}
            ></p>
          )}
          <p className="mt-4 text-white text-sm text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-700 hover:underline">
              Login here!
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup;
