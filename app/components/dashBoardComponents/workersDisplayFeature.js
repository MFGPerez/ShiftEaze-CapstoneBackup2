"use client";
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { firebaseApp } from "utils/firebase"; // Adjust the import path according to your project structure
import { AiOutlineClose } from "react-icons/ai";

// Function to send SMS
const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await fetch('/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, message }),
    });
    const data = await response.json();
    if (data.success) {
      console.log('SMS sent successfully');
    } else {
      console.error('Error sending SMS:', data.error);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

const ContactWorkerPopup = ({ worker, onClose, onSendMsg }) => (
  <div className="absolute top-0 left-0 mt-15 bg-black p-4 rounded-lg shadow-lg w-64">
    <div className="bg-white text-black p-2 rounded-t-lg flex justify-between items-center w-full">
      <h2 className="text-xl font-bold">Contact Worker</h2>
      <AiOutlineClose
        className="cursor-pointer text-red-500"
        onClick={onClose}
      />
    </div>
    <button
      onClick={onSendMsg}
      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-2 w-full"
    >
      Send Msg
    </button>
  </div>
);

const SendMsgPopup = ({ worker, onClose, message, setMessage, handleSendMsg }) => (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-600 hover:text-red-800 hover:scale-110 transition-transform"
      >
        <AiOutlineClose size={24} />
      </button>
      <div className="text-black">
        <h2 className="text-3xl font-comfortaa font-bold mb-4">Manager</h2>
        <div className="mt-4">
          <p className="text-2xl font-comfortaa font-semibold mb-2">Message:</p>
          <textarea
            className="w-full px-4 py-2 text-black rounded-md focus:outline-none"
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md transition-colors hover:bg-blue-600 w-full"
          onClick={handleSendMsg}
        >
          Send
        </button>
      </div>
    </div>
  </div>
);

const WorkersDisplayFeature = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showMsgPopup, setShowMsgPopup] = useState(false);
  const [message, setMessage] = useState("");

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchWorkers = async () => {
      const user = auth.currentUser;
      if (user) {
        const workersQuery = query(collection(db, "managers", user.uid, "workers"));
        const workersSnapshot = await getDocs(workersQuery);
        const workersList = workersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWorkers(workersList);
      }
    };

    fetchWorkers();
  }, [auth, db]);

  const handleCheckboxChange = (worker) => {
    setSelectedWorker(worker);
    setShowMsgPopup(false);
  };

  const handleSendMsgClick = () => {
    setShowMsgPopup(true);
  };

  const handleSendMsg = () => {
    if (selectedWorker && selectedWorker.phoneNumber) {
      sendSMS(selectedWorker.phoneNumber, `Manager: Marcel Gallardo\n\n${message}`);
    } else {
      console.error('Worker phone number is missing');
    }
    setShowMsgPopup(false);
    setSelectedWorker(null);
  };

  const handleClosePopups = () => {
    setSelectedWorker(null);
    setShowMsgPopup(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-11/12 max-w-lg mt-48 ml-36">
      <div className="w-full max-w-lg">
        <div className="bg-gray-100 text-black text-center p-4 rounded-t-lg w-full">
          <h2 className="text-3xl font-bold font-comfortaa">Workers</h2>
        </div>
        <div className="bg-black opacity-90 p-7 rounded-b-lg shadow-lg w-full">
          <div className="max-h-96 overflow-y-auto">
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center p-2 border-b border-gray-200 relative">
                <input
                  type="checkbox"
                  className="mr-4"
                  checked={selectedWorker === worker}
                  onChange={() => handleCheckboxChange(worker)}
                />
                <img
                  src={worker.profilePictureUrl || "/default-profile.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1">
                  <p className="text-lg font-bold font-comfortaa">{worker.firstName} {worker.lastName}</p>
                  <p className="text-gray-400 font-nixie font-semibold">{worker.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedWorker && !showMsgPopup && (
        <div className="absolute left-0 top-1/4 -left-20">
          <ContactWorkerPopup
            worker={selectedWorker}
            onClose={handleClosePopups}
            onSendMsg={handleSendMsgClick}
          />
        </div>
      )}

      {showMsgPopup && (
        <SendMsgPopup
          worker={selectedWorker}
          onClose={handleClosePopups}
          message={message}
          setMessage={setMessage}
          handleSendMsg={handleSendMsg}
        />
      )}
    </div>
  );
};

export default WorkersDisplayFeature;
