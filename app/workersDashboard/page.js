"use client";

import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { firebaseApp } from "../../utils/firebase"; // Adjust the import path according to your project structure
import Image from "next/image";
import WorkersDashNavBar from "@components/workersDashNavBar";

/**
 * WorkersDashboard component displays a list of workers and provides search functionality.
 */
const WorkersDashboard = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch workers from Firestore when the component mounts
  useEffect(() => {
    const fetchWorkers = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }

      try {
        const workersRef = collection(db, "managers", user.uid, "workers");
        const q = query(workersRef);
        const querySnapshot = await getDocs(q);

        const workersList = [];
        querySnapshot.forEach((doc) => {
          workersList.push({ id: doc.id, ...doc.data() });
        });

        setWorkers(workersList);
        setLoading(false);
      } catch (error) {
        setError("Error fetching workers: " + error.message);
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [auth, db]);

  // Update the current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle selecting a worker to view their details
  const handleSelectWorker = (workerId) => {
    router.push(`/workerPin?id=${workerId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 items-center justify-between">
      <WorkersDashNavBar />
      <main className="flex flex-1 flex-col justify-center items-center text-white w-full">
        <div className="text-center mt-5 mb-10">
          <h1 className="text-5xl font-comfortaa font-bold">Welcome!</h1>
          <p className="font-nixie">Please find your name to get started</p>
          <div className="text-lg mt-5">
            {/* Display Current Time */}
            <p className="font-comfortaa font-semibold">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
            {/* Display Current Date */}
            <p className="font-comfortaa font-semibold">
              {currentTime.toLocaleDateString([], {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="w-full max-w-4xl mt-10">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search worker by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-md mb-4 text-black focus:outline-none font-nixie"
          />
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="p-6 rounded-lg shadow-lg w-full bg-black opacity-85">
              <h2 className="text-white text-2xl mb-4 font-comfortaa font-semibold">Workers List</h2>
              <div className="max-h-60 overflow-y-auto">
                <ul>
                  {workers
                    .filter(
                      (worker) =>
                        (worker.firstName && worker.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (worker.lastName && worker.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .slice(0, 6)
                    .map((worker) => (
                      <li
                        key={worker.id}
                        className="py-2 cursor-pointer text-white flex items-center hover:bg-orange-600 rounded-full"
                        onClick={() => handleSelectWorker(worker.id)}
                      >
                        {/* Display Profile Picture */}
                        <Image
                          src={
                            worker.profilePictureUrl ||
                            "https://via.placeholder.com/40"
                          }
                          alt={`${worker.firstName} ${worker.lastName}`}
                          width={40}
                          height={40}
                          className="rounded-full mr-4"
                        />
                        <span className="font-nixie">
                          {worker.firstName} {worker.lastName}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkersDashboard;
