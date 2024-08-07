"use client";

import React, { useState, useEffect } from "react";
import HorizontalCalendar from "@/components/calendarComponents/horizontalCalendar";
import { WorkersProvider } from "@/components/calendarComponents/workersContext"; // Adjust the import path as necessary
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from 'utils/firebase';
import CalendarNavBar from "@components/calendarComponents/calendarNavBar";

/**
 * Page Component
 * 
 * This component is responsible for displaying the horizontal calendar and managing the state
 * related to workers and job titles. It fetches worker data from Firestore and handles user authentication.
 * 
 * @returns {JSX.Element} The Page component
 */
const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workers, setWorkers] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [jobTitles, setJobTitles] = useState([]);

  const auth = getAuth(firebaseApp);  // Initialize auth
  const db = getFirestore(firebaseApp);  // Initialize Firestore

  useEffect(() => {
    /**
     * Fetch workers from Firestore and update the state
     */
    const fetchWorkers = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not signed in.");
          setLoading(false);
          return;
        }

        const userWorkersRef = collection(db, "users", user.uid, "workers");
        const querySnapshot = await getDocs(userWorkersRef);
        const workersList = [];
        const positionsSet = new Set();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          workersList.push({ id: doc.id, ...data });
          if (data.position) {
            positionsSet.add(data.position);
          }
        });

        setWorkers(workersList);
        setJobTitles([...positionsSet]);
        setLoading(false);
      } catch (error) {
        setError("Error fetching workers: " + error.message);
        setLoading(false);
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchWorkers();
      } else {
        setError("User not authenticated.");
        setLoading(false);
      }
    });
  }, [auth, db]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <WorkersProvider value={{ workers, setWorkers }}>
      <div className="mainpage">
        <div className="flex">
          <div className="flex-grow">
            <CalendarNavBar />
            <HorizontalCalendar jobTitles={jobTitles} selectedJobTitle={selectedJobTitle} setSelectedJobTitle={setSelectedJobTitle} />
          </div>
        </div>
      </div>
    </WorkersProvider>
  );
};

export default Page;
