"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { firebaseApp } from "../../utils/firebase"; // Adjust the import path according to your project structure
import Link from "next/link";

const EditWorker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("id");
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  const [worker, setWorker] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [pin, setPin] = useState("");
  const [pinVisible, setPinVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchWorker = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }

      try {
        const workerDocRef = doc(db, "managers", user.uid, "workers", workerId);
        const workerDoc = await getDoc(workerDocRef);
        if (workerDoc.exists()) {
          const workerData = workerDoc.data();
          setWorker(workerData);
          setFirstName(workerData.firstName);
          setLastName(workerData.lastName);
          setPosition(workerData.position);
          setPhoneNumber(workerData.phoneNumber);
          setStartDate(workerData.startDate);
          setPin(workerData.pin);
          setEmail(workerData.email);
          setPasscode(workerData.passcode);
          setAddress(workerData.address);
          setCity(workerData.city);
          setState(workerData.state);
          setZipCode(workerData.zipCode);
        } else {
          setError("Worker not found.");
        }
        setLoading(false);
      } catch (error) {
        setError("Error fetching worker: " + error.message);
        setLoading(false);
      }
    };

    fetchWorker();
  }, [auth, db, workerId]);

  const handleUpdateWorker = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      setError("User not signed in.");
      return;
    }

    if (pin.length !== 4 || isNaN(pin)) {
      setPinError("PIN must be a 4-digit number.");
      return;
    }

    // Validate Canadian postal code format
    const postalCodePattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!postalCodePattern.test(zipCode)) {
      setError("Invalid postal code format.");
      return;
    }

    try {
      let profilePictureUrl = worker.profilePictureUrl;
      if (profilePicture) {
        const profilePictureRef = ref(
          storage,
          `users/${user.uid}/profilePictures/${profilePicture.name}`
        );
        const snapshot = await uploadBytes(profilePictureRef, profilePicture);
        profilePictureUrl = await getDownloadURL(snapshot.ref);
      }

      const workerDocRef = doc(db, "managers", user.uid, "workers", workerId);
      await updateDoc(workerDocRef, {
        firstName,
        lastName,
        position,
        phoneNumber,
        startDate,
        passcode,
        pin,
        email,
        address,
        city,
        state,
        zipCode,
        profilePictureUrl,
      });

      setSuccessMessage("Worker updated successfully!");
      setTimeout(() => {
        router.push("/workers");
      }, 2000);
    } catch (error) {
      setError("Error updating worker: " + error.message);
    }
  };

  const handlePinChange = (e) => {
    setPin(e.target.value);
    if (e.target.value.length === 4 && !isNaN(e.target.value)) {
      setPinError("");
    }
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setFirstName(worker.firstName);
    setLastName(worker.lastName);
    setPosition(worker.position);
    setPhoneNumber(worker.phoneNumber);
    setStartDate(worker.startDate);
    setProfilePicture(null);
    setPasscode(worker.passcode);
    setPin(worker.pin);
    setEmail(worker.email);
    setAddress(worker.address);
    setCity(worker.city);
    setState(worker.state);
    setZipCode(worker.zipCode);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col justify-center items-center text-white">
      <div className="bg-black opacity-85 p-10 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-comfortaa font-bold text-white">Edit Worker</h1>
          <Link
            href="/workers"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-gray-400 font-comfortaa font-semibold"
          >
            Back to Workers
          </Link>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <form onSubmit={handleUpdateWorker} className="space-y-6">
            {error && <p className="text-red-500">{error}</p>}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">Passcode</label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">Position</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
              <div className="w-full px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/3 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
              <div className="w-full md:w-1/3 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
              <div className="w-full md:w-1/3 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-3 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-6">
                <label className="block text-white font-comfortaa font-semibold">PIN</label>
                <div className="relative">
                  <input
                    type={pinVisible ? "text" : "password"}
                    value={pin}
                    onChange={handlePinChange}
                    className="w-full px-4 py-2 mt-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-nixie"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPinVisible(!pinVisible)}
                    className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                  >
                    {pinVisible ? "Hide" : "Show"}
                  </button>
                </div>
                {pinError && <p className="text-red-500 mt-2">{pinError}</p>}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300 font-comfortaa font-semibold"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Worker"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-gray-400 font-comfortaa font-semibold"
              >
                Reset Form
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditWorker;
