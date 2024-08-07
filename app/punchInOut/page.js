"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { firebaseApp } from '../../utils/firebase';
import Link from 'next/link';
import WorkersDashNavBar from '@components/workersDashNavBar';

const PunchInOutComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const managerId = searchParams.get('managerId');
  const firstName = searchParams.get('firstName');
  const lastName = searchParams.get('lastName');
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [worker, setWorker] = useState(null);
  const [punchInTime, setPunchInTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    if (managerId) {
      localStorage.setItem('managerId', managerId);
    }
    const fetchWorker = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError('User not signed in.');
        setLoading(false);
        return;
      }

      try {
        const workersQuery = query(
          collection(db, 'managers', managerId, 'workers'),
          where('firstName', '==', firstName),
          where('lastName', '==', lastName)
        );
        const workersSnapshot = await getDocs(workersQuery);

        if (!workersSnapshot.empty) {
          const workerDoc = workersSnapshot.docs[0];
          const workerData = workerDoc.data();
          setWorker(workerData);

          if (workerData.punchInTime) {
            setPunchInTime(workerData.punchInTime.toDate());
            setElapsedTime(new Date() - workerData.punchInTime.toDate());
          }
          if (workerData.breakStartTime) {
            setBreakStartTime(workerData.breakStartTime.toDate());
            setBreakTime(new Date() - workerData.breakStartTime.toDate());
            setIsOnBreak(true);
          }
        } else {
          setError('Worker not found.');
        }
        setLoading(false);
      } catch (error) {
        setError('Error fetching worker: ' + error.message);
        setLoading(false);
      }
    };

    fetchWorker();
  }, [auth, db, managerId, firstName, lastName]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (punchInTime) {
        setElapsedTime(new Date() - punchInTime);
      }
      if (isOnBreak) {
        setBreakTime(new Date() - breakStartTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [punchInTime, isOnBreak, breakStartTime]);

  const handlePunchIn = async () => {
    const punchInDate = new Date();
    setPunchInTime(punchInDate);
    const user = auth.currentUser;
    if (!user) {
      setError('User not signed in.');
      return;
    }

    try {
      const workerDocRef = doc(
        db,
        'managers',
        managerId,
        'workers',
        `${firstName}_${lastName}`
      );
      await updateDoc(workerDocRef, { punchInTime: punchInDate });
      showPopupMessage(
        'Punch in Successful!',
        'You have been punched in. Have a good shift!',
        'green'
      );
    } catch (error) {
      setError('Error punching in: ' + error.message);
    }
  };

  const handlePunchOut = async () => {
    const punchOutTime = new Date();
    const user = auth.currentUser;
    if (!user) {
      setError('User not signed in.');
      return;
    }

    const durationMs = punchOutTime - punchInTime;
    const hoursWorked = durationMs / (1000 * 60 * 60);
    const date = new Date().toISOString().split('T')[0];

    try {
      const workerDocRef = doc(
        db,
        'managers',
        managerId,
        'workers',
        `${firstName}_${lastName}`
      );
      const docSnap = await getDoc(workerDocRef);
      let workData = {};
      if (docSnap.exists()) {
        workData = docSnap.data().workData || {};
      }
      workData[date] = workData[date] || {
        workHours: 0,
        breakHours: 0,
        paidHours: 0,
      };
      workData[date].workHours += hoursWorked;
      workData[date].breakHours += breakTime / (1000 * 60 * 60);
      workData[date].paidHours =
        workData[date].workHours - workData[date].breakHours;

      await updateDoc(workerDocRef, {
        workData,
        punchInTime: null,
        breakStartTime: null,
      });
      setPunchInTime(null);
      setElapsedTime(0);
      setBreakTime(0);
      setIsOnBreak(false);
      showPopupMessage(
        'Punch out Successful!',
        'You have been punched out. Have a good day!',
        'red'
      );
    } catch (error) {
      setError('Error punching out: ' + error.message);
    }
  };

  const handleStartBreak = () => {
    const breakStartDate = new Date();
    setBreakStartTime(breakStartDate);
    setIsOnBreak(true);
    showPopupMessage('Started Break, Enjoy!', '', 'yellow');
  };

  const handleEndBreak = async () => {
    const breakEndTime = new Date();
    const breakDurationMs = breakEndTime - breakStartTime;
    const breakHours = breakDurationMs / (1000 * 60 * 60);

    setIsOnBreak(false);

    const user = auth.currentUser;
    if (!user) {
      setError('User not signed in.');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    try {
      const workerDocRef = doc(
        db,
        'managers',
        managerId,
        'workers',
        `${firstName}_${lastName}`
      );
      const docSnap = await getDoc(workerDocRef);
      let workData = {};
      if (docSnap.exists()) {
        workData = docSnap.data().workData || {};
      }
      workData[date] = workData[date] || {
        workHours: 0,
        breakHours: 0,
        paidHours: 0,
      };
      workData[date].breakHours += breakHours;
      workData[date].paidHours =
        workData[date].workHours - workData[date].breakHours;

      await updateDoc(workerDocRef, { workData, breakStartTime: null });
      showPopupMessage('Ended Break, Welcome Back!', '', 'yellow');
    } catch (error) {
      setError('Error ending break: ' + error.message);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const showPopupMessage = (title, message, color) => {
    setPopupMessage({ title, message, color });
    setTimeout(() => {
      setPopupMessage(null);
    }, 3000); // 3 seconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 flex flex-col justify-center items-center text-white relative">
      <WorkersDashNavBar />
      <div className="w-full max-w-6xl mt-10">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="bg-gray-100 p-4 rounded-t-lg shadow-lg text-center">
              <h2 className="text-black text-3xl font-comfortaa font-bold mb-5">
                Welcome, {worker ? worker.firstName : 'Worker'}{' '}
                {worker ? worker.lastName : 'Worker'}
              </h2>
            </div>
            <div className="bg-black opacity-95 p-10 rounded-b-lg shadow-lg w-full text-black">
              <div className="flex flex-col items-center mb-6">
                <p className="text-gray-200 text-2xl mb-4 font-comfortaa font-bold">
                  {currentTime.toLocaleDateString()}
                </p>
                <p className="text-5xl text-white font-comfortaa font-bold">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
              <div className="mb-8 text-center">
                <Image
                  src={worker?.profilePictureUrl || '/default-profile.png'}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
              </div>
              <div className="mb-8 text-center">
                <button
                  onClick={handlePunchIn}
                  className="bg-green-500 text-white px-6 py-3 rounded-md mr-2 shadow-md hover:bg-green-600 border-2 border-transparent hover:border-green-300 font-comfortaa font-semibold"
                  disabled={!!punchInTime}
                >
                  Punch In
                </button>
                <button
                  onClick={handlePunchOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md mr-2 shadow-md border-2 border-transparent hover:border-red-300 font-comfortaa font-semibold"
                  disabled={!punchInTime}
                >
                  Punch Out
                </button>
                <button
                  onClick={handleStartBreak}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-md mr-2 shadow-md hover:bg-yellow-600 border-2 border-transparent hover:border-yellow-300 font-comfortaa font-semibold"
                  disabled={isOnBreak || !punchInTime}
                >
                  Start Break
                </button>
                <button
                  onClick={handleEndBreak}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-yellow-600 border-2 border-transparent hover:border-yellow-300 font-comfortaa font-semibold"
                  disabled={!isOnBreak}
                >
                  End Break
                </button>
              </div>
              <div className="text-lg text-white text-center font-nixie">
                <p>Worked Hours: {formatTime(elapsedTime - breakTime)}</p>
                <p>Break Time: {formatTime(breakTime)}</p>
                <p>Paid Hours: {formatTime(elapsedTime - breakTime)}</p>
              </div>
              <div className="text-center mt-6">
              </div>
            </div>
          </>
        )}
        {popupMessage && (
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-md shadow-md ${
              popupMessage.color === 'green'
                ? 'bg-green-500 border-2 border-transparent border-green-400'
                : popupMessage.color === 'red'
                ? 'bg-red-500 border-2 border-transparent border-red-400'
                : 'bg-yellow-500 border-2 border-transparent border-yellow-400'
            }`}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3
                className={`text-lg font-bold mb-4 ${
                  popupMessage.color === 'green'
                    ? 'text-green-500'
                    : popupMessage.color === 'red'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`}
              >
                {popupMessage.title}
              </h3>
              <p className="text-black">{popupMessage.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PunchInOut = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PunchInOutComponent />
  </Suspense>
);

export default PunchInOut;
