"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { firebaseApp } from "../../utils/firebase"; // Adjust the import path according to your project structure
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";

// Custom styles for the Calendar
const CustomCalendar = styled(Calendar)`
  width: 100%;
  max-width: 100%;
  background-color: white;
  border: none;
  font-family: Arial, Helvetica, sans-serif;

  .react-calendar__tile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80px;
  }

  .react-calendar__tile--now {
    background: #c0eaff;
    color: black;
  }

  .react-calendar__tile--active {
    background: #007bff;
    color: white;
  }

  .react-calendar__month-view__days__day {
    margin: 0.5rem;
    padding: 0.5rem;
    border-radius: 10px;
  }

  .react-calendar__month-view__days__day--weekend {
    background-color: #f8f9fa;
  }

  .react-calendar__month-view__weekdays {
    font-weight: bold;
  }
`;

const WorkerHours = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId");
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState({});

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
          setFilteredData(workerDoc.data().workData || {});
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

  const filterByDateRange = () => {
    if (!worker || !worker.workData) return;

    const filtered = {};
    Object.keys(worker.workData).forEach((date) => {
      const dateObj = new Date(date);
      if (dateObj >= startDate && dateObj <= endDate) {
        filtered[date] = worker.workData[date];
      }
    });

    setFilteredData(filtered);
  };

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col justify-center items-center text-white">
      <div className="w-full max-w-6xl mt-10">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg w-full text-black">
            <h2 className="text-gray-800 text-3xl mb-6 font-bold">
              Worked Hours
            </h2>
            <div className="flex justify-between mb-6">
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Start Date"
                  className="px-4 py-2 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="End Date"
                  className="px-4 py-2 rounded-md"
                />
              </div>
              <button
                onClick={filterByDateRange}
                className="bg-blue-500 mt-6 text-white px-6 py-3 rounded-md mr-2 shadow-md hover:bg-blue-600 border-2 border-transparent hover:border-blue-300"
              >
                Filter
              </button>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg shadow-lg">
              <CustomCalendar
                value={startDate}
                tileContent={({ date, view }) => {
                  if (view === "month") {
                    const dateString = date.toISOString().split("T")[0];
                    const data = filteredData[dateString];
                    if (data) {
                      return (
                        <div>
                          <p className="text-xs font-semibold">
                            Worked: {formatTime(data.workHours)}
                          </p>
                          <p className="text-xs font-semibold">
                            Break: {formatTime(data.breakHours)}
                          </p>
                          <p className="text-xs font-semibold">
                            Paid: {formatTime(data.paidHours)}
                          </p>
                        </div>
                      );
                    }
                  }
                  return null;
                }}
              />
            </div>
            <Link
              href={`/punchInOut?workerId=${workerId}`}
              className="bg-gray-500 mt-6 text-white px-4 py-2 rounded-md inline-block shadow-md hover:bg-gray-600 border-2 border-transparent hover:border-gray-400"
            >
              Back to Punch In/Out
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerHours;
