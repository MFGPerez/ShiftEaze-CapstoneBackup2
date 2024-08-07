"use client";

import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { firebaseApp } from "../../utils/firebase"; // Adjust the import path according to your project structure
import PageNavBar from "@components/pageNavBar";

/**
 * TrackWorkHistory component renders a page for tracking the work history of workers.
 * It fetches the list of workers and their respective work history based on selected date range.
 */
const TrackWorkHistory = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [totalBreaks, setTotalBreaks] = useState(0);
  const [totalPaidHours, setTotalPaidHours] = useState(0);

  useEffect(() => {
    const fetchWorkers = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not signed in.");
        setLoading(false);
        return;
      }

      try {
        const managerWorkersRef = collection(db, "managers", user.uid, "workers");
        const q = query(managerWorkersRef);
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

  useEffect(() => {
    if (selectedWorker) {
      fetchWorkHistory();
    }
  }, [selectedWorker, startDate, endDate]);

  /**
   * Fetches the work history of the selected worker within the specified date range.
   */
  const fetchWorkHistory = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setError("User not signed in.");
      setLoading(false);
      return;
    }

    try {
      const workerWorkHistoryRef = collection(
        db,
        "managers",
        user.uid,
        "workers",
        selectedWorker,
        "workHistory"
      );
      let q = query(workerWorkHistoryRef);

      if (startDate) {
        q = query(q, where("date", ">=", startDate));
      }
      if (endDate) {
        q = query(q, where("date", "<=", endDate));
      }

      const querySnapshot = await getDocs(q);
      const historyList = [];
      let totalHoursWorked = 0;
      let totalBreakHours = 0;
      let totalPaidHoursWorked = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        historyList.push({ id: doc.id, ...data });
        totalHoursWorked += data.workHours || 0;
        totalBreakHours += data.breakHours || 0;
        totalPaidHoursWorked += data.paidHours || 0;
      });

      setWorkHistory(historyList);
      setTotalHours(totalHoursWorked);
      setTotalBreaks(totalBreakHours);
      setTotalPaidHours(totalPaidHoursWorked);
      setLoading(false);
    } catch (error) {
      setError("Error fetching work history: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col justify-center items-center text-white">
      <PageNavBar /> {/* Using the new nav bar component */}
      <main className="flex flex-1 flex-col justify-center items-center text-white w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-comfortaa font-bold">Work History</h1>
        </div>
        <div className="w-full max-w-4xl mt-10">
          <select
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="w-full px-4 py-2 rounded-md mb-4 font-nixie text-black"
            value={selectedWorker || ""}
          >
            <option value="">Select Worker</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.firstName} {worker.lastName}
              </option>
            ))}
          </select>
          <div className="flex justify-between mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded-md font-nixie text-white"
              style={{ colorScheme: "dark" }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded-md font-nixie text-white"
              style={{ colorScheme: "dark" }}
            />
          </div>
          <button
            onClick={fetchWorkHistory}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 rounded-lg hover:bg-blue-600 border-2 border-transparent hover:border-blue-400 font-comfortaa font-semibold"
          >
            Filter
          </button>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="bg-black opacity-85 p-6 rounded-lg shadow-lg w-full">
              <h2 className="text-white text-2xl font-comfortaa font-bold mb-4">Work History</h2>
              <div className="mb-4">
                <p className="text-white font-comfortaa font-semibold">Total Hours Worked: {totalHours}</p>
                <p className="text-white font-comfortaa font-semibold">Total Break Hours: {totalBreaks}</p>
                <p className="text-white font-comfortaa font-semibold">Total Paid Hours: {totalPaidHours}</p>
              </div>
              {workHistory.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider font-comfortaa font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider font-comfortaa font-semibold">
                        Hours Worked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider font-comfortaa font-semibold">
                        Break Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider font-comfortaa font-semibold">
                        Paid Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 text-black whitespace-nowrap font-nixie">
                          {record.date}
                        </td>
                        <td className="px-6 py-4 text-black whitespace-nowrap font-nixie">
                          {record.workHours}
                        </td>
                        <td className="px-6 py-4 text-black whitespace-nowrap font-nixie">
                          {record.breakHours}
                        </td>
                        <td className="px-6 py-4 text-black whitespace-nowrap font-nixie">
                          {record.paidHours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-white font-comfortaa font-semibold">No work history available.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="bg-black opacity-85 text-white py-1 w-full">
        <div className="container mx-auto text-center py-8">
          <p>
            &copy; {new Date().getFullYear()} ShiftEaze. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TrackWorkHistory;
