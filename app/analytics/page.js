"use client";

import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, query, getDocs, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { firebaseApp } from "../../utils/firebase"; // Adjust the import path according to your project structure
import AnalyticsNavBar from "@components/analyticsNavBar"; // use this 

/**
 * Analytics Component
 * 
 * This component fetches and displays worker and work data, allowing the user to filter
 * the data by date range and view summary statistics.
 * 
 * @returns {JSX.Element} The Analytics component
 */
const Analytics = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [workers, setWorkers] = useState([]);
  const [workData, setWorkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchWorkersAndData();
  }, [auth, db]);

  /**
   * Fetch workers and their associated work data from Firestore
   */
  const fetchWorkersAndData = async () => {
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

      const workDataList = [];
      for (const worker of workersList) {
        const workerRef = collection(
          db,
          "managers",
          user.uid,
          "workers",
          worker.id,
          "workHistory"
        );
        const workQuerySnapshot = await getDocs(workerRef);
        const workerWorkData = [];
        workQuerySnapshot.forEach((workDoc) => {
          workerWorkData.push(workDoc.data());
        });
        workDataList.push({ worker, workData: workerWorkData });
      }

      setWorkers(workersList);
      setWorkData(workDataList);
      setLoading(false);
    } catch (error) {
      setError("Error fetching data: " + error.message);
      setLoading(false);
    }
  };

  /**
   * Filter the work data based on the selected date range
   * 
   * @returns {Array} The filtered work data
   */
  const filterWorkData = () => {
    const filteredWorkData = workData.map((data) => {
      const filteredData = data.workData.filter((work) => {
        const workDate = new Date(work.date);
        const isAfterStart = startDate ? workDate >= new Date(startDate) : true;
        const isBeforeEnd = endDate ? workDate <= new Date(endDate) : true;
        return isAfterStart && isBeforeEnd;
      });
      return { ...data, workData: filteredData };
    });
    return filteredWorkData;
  };

  /**
   * Calculate the total hours worked
   * 
   * @param {Array} workData - The work data to calculate total hours for
   * @returns {number} The total hours worked
   */
  const calculateTotalHours = (workData) => {
    return workData.reduce((total, day) => total + day.workHours, 0);
  };

  /**
   * Calculate the hours worked in the current month
   * 
   * @param {Array} workData - The work data to calculate current month hours for
   * @returns {number} The hours worked in the current month
   */
  const calculateCurrentMonthHours = (workData) => {
    const currentMonth = new Date().getMonth();
    return workData
      .filter((day) => new Date(day.date).getMonth() === currentMonth)
      .reduce((total, day) => total + day.workHours, 0);
  };

  /**
   * Calculate the hours worked in the current week
   * 
   * @param {Array} workData - The work data to calculate current week hours for
   * @returns {number} The hours worked in the current week
   */
  const calculateCurrentWeekHours = (workData) => {
    const currentWeekStart = new Date();
    currentWeekStart.setDate(
      currentWeekStart.getDate() - currentWeekStart.getDay()
    );
    currentWeekStart.setHours(0, 0, 0, 0);

    return workData
      .filter((day) => new Date(day.date) >= currentWeekStart)
      .reduce((total, day) => total + day.workHours, 0);
  };

  /**
   * Calculate the total combined hours worked for all workers in a given period
   * 
   * @param {Array} workData - The work data to calculate total combined hours for
   * @param {string} period - The period to calculate hours for ("month" or "week")
   * @returns {number} The total combined hours worked
   */
  const calculateTotalCombinedHours = (workData, period) => {
    return workData.reduce((total, data) => {
      if (period === "month") {
        return total + calculateCurrentMonthHours(data.workData);
      } else if (period === "week") {
        return total + calculateCurrentWeekHours(data.workData);
      }
      return total;
    }, 0);
  };

  const filteredWorkData = filterWorkData();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col justify-center items-center text-white">
      <AnalyticsNavBar /> {/* Using the new nav bar component */}
      <main className="m-10 flex flex-1 flex-col justify-center items-center text-white w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-comfortaa font-bold py-4">Workforce Analytics</h1>
        </div>
        <div className="w-full max-w-6xl mt-10 bg-black opacity-95 p-6 rounded-lg shadow-lg text-black ">
          <div className="flex justify-between mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded-md text-black"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded-md text-black"
            />
            <button
              onClick={fetchWorkersAndData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300 font-comfortaa font-semibold"
            >
              Filter
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-comfortaa font-semibold mb-4">Summary</h2>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-600 uppercase tracking-wider">
                        Worker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-600 uppercase tracking-wider">
                        Total Hours Worked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-600 uppercase tracking-wider">
                        Hours This Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-600 uppercase tracking-wider">
                        Hours This Week
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkData.map((data, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap font-nixie">
                          {data.worker.firstName} {data.worker.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-nixie">
                          {calculateTotalHours(data.workData)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-nixie">
                          {calculateCurrentMonthHours(data.workData)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-nixie">
                          {calculateCurrentWeekHours(data.workData)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-6">
                  <h3 className="text-xl font-comfortaa font-bold text-white">
                    Total Hours for All Workers
                  </h3>
                  <p className="text-white font-comfortaa font-semibold">
                    Total Hours This Month:{" "}
                    {calculateTotalCombinedHours(filteredWorkData, "month")}
                  </p>
                  <p className="text-white font-comfortaa font-semibold">
                    Total Hours This Week:{" "}
                    {calculateTotalCombinedHours(filteredWorkData, "week")}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
     
      <footer className="bg-black opacity-85 text-white py-5 w-full"> 
        <div className="container mx-auto text-center">
          <p>
            &copy; {new Date().getFullYear()} ShiftEaze. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;
