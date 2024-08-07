"use client";
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { firebaseApp } from "../../utils/firebase"; // Adjust the import path according to your project structure

const WorkerPin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("id");
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [pin, setPin] = useState("");
  const [pinVisible, setPinVisible] = useState(false);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setWorker(workerDoc.data());
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

  const handleVerifyPin = () => {
    if (worker && worker.pin === pin) {
      router.push(`/punchInOut?workerId=${workerId}`);
    } else {
      setError("Invalid PIN");
    }
  };

  const handlePinChange = (number) => {
    setPin((prevPin) => prevPin + number);
  };

  const handleBackspace = () => {
    setPin((prevPin) => prevPin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col justify-center items-center text-white">
      <div className="bg-black opacity-85 p-6 rounded-lg shadow-lg w-9/12 mt-10 flex flex-col items-center">
        {loading ? (
          <p className="text-white">Loading…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <h2 className="text-2xl text-white font-bold mb-4">
              Welcome {worker?.firstName} {worker?.lastName}
            </h2>
            <h3 className="text-lg mb-4 text-white">Enter your PIN</h3>
            <div className="relative w-full mb-4">
              <input
                type={pinVisible ? "text" : "password"}
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2 rounded-md text-black focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setPinVisible(!pinVisible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 focus:outline-none"
              >
                {pinVisible ? "Hide" : "Show"}
              </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "←", 0, ""].map((number, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (number === "←") {
                      handleBackspace();
                    } else if (number !== "") {
                      handlePinChange(number);
                    }
                  }}
                  className={`py-4 px-8 text-2xl font-semibold text-blue-500 rounded focus:outline-none hover:text-blue-300 ${
                    number === "" ? "pointer-events-none" : ""
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
            <button
              onClick={handleVerifyPin}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300 mt-4"
            >
              Verify
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerPin;
