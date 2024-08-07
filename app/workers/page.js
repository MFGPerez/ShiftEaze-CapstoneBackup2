"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { firebaseApp } from "../../utils/firebase";
import { CSVLink } from "react-csv";
import PageNavBar from "@components/pageNavBar";
import { AiOutlineClose } from "react-icons/ai";

const Workers = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [workers, setWorkers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, [filterPosition]);

  const fetchWorkers = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("User not signed in.");
      setLoading(false);
      return;
    }

    try {
      const workersRef = collection(db, "managers", user.uid, "workers");
      const q = query(workersRef, orderBy("firstName"));
      const querySnapshot = await getDocs(q);
      const workersList = [];
      const positionsSet = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        workersList.push({
          id: doc.id,
          ...data,
        });
        if (data.position) {
          positionsSet.add(data.position);
        }
      });

      setWorkers(workersList);
      setPositions([...positionsSet]);
      setLoading(false);
    } catch (error) {
      setError("Error fetching workers: " + error.message);
      setLoading(false);
    }
  };

  const handleAddWorker = () => {
    router.push("/addWorker");
  };

  const handleEdit = (workerId) => {
    router.push(`/editWorker?id=${workerId}`);
  };

  const handleView = (workerId) => {
    const worker = workers.find((w) => w.id === workerId);
    setSelectedWorker(worker);
  };

  const handleClosePopup = () => {
    setSelectedWorker(null);
  };

  const handleDeleteSelected = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("User not signed in.");
      return;
    }

    try {
      const selectedWorkers = workers.filter((worker) => worker.selected);
      for (const worker of selectedWorkers) {
        await deleteDoc(doc(db, "managers", user.uid, "workers", worker.id));
      }
      fetchWorkers(); // Refresh the worker list after deletion
    } catch (error) {
      setError("Error deleting workers: " + error.message);
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    return (
      (worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.lastName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterPosition ? worker.position === filterPosition : true)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-blue-600 to-blue-800 items-center justify-between">
      <PageNavBar /> {/* Using the new nav bar component */}
      <main className="flex-1 flex flex-col items-center text-white py-10">
        <div className="w-full max-w-7xl mt-10 px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <button
                onClick={handleAddWorker}
                className="font-comfortaa font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300"
              >
                Add Worker
              </button>
              {workers.some((worker) => worker.selected) && (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    className="font-comfortaa font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors ml-2 border-2 border-transparent hover:border-red-300"
                  >
                    Delete
                  </button>
                  <CSVLink
                    data={workers.filter((worker) => worker.selected)}
                    filename={"workers.csv"}
                    className=" font-comfortaa font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors ml-2 border-2 border-transparent hover:border-green-300"
                  >
                    Export CSV
                  </CSVLink>
                </>
              )}
            </div>
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search workers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-black focus:outline-none shadow-md font-nixie"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-red-600 hover:text-red-800"
                >
                  &times;
                </button>
              )}
            </div>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="px-4 py-2 rounded-md text-black focus:outline-none shadow-md font-nixie"
            >
              <option value="">All Positions</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-white text-center">Loading…</p>
          ) : error ? (
            <p className="text-red-300 text-center">{error}</p>
          ) : (
            <div className="bg-black opacity-95 p-6 rounded-lg shadow-lg w-full">
              <h2 className="text-white text-3xl mb-4 font-comfortaa font-bold">
                Workers List
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-black bg-opacity-75">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setWorkers((prevWorkers) =>
                              prevWorkers.map((worker) => ({
                                ...worker,
                                selected: checked,
                              }))
                            );
                          }}
                        />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("firstName")}
                      >
                        Name
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("lastName")}
                      >
                        Surname
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("position")}
                      >
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-300 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-300 uppercase tracking-wider">
                        Edit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-comfortaa font-semibold text-gray-300 uppercase tracking-wider">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-black divide-y divide-gray-200">
                    {filteredWorkers.map((worker) => (
                      <tr key={worker.id}>
                        <td className="px-6 py-4 text-black whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={worker.selected || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setWorkers((prevWorkers) =>
                                prevWorkers.map((w) =>
                                  w.id === worker.id
                                    ? { ...w, selected: checked }
                                    : w
                                )
                              );
                            }}
                          />
                        </td>
                        <td
                          className="px-6 py-4 text-white font-nixie whitespace-nowrap cursor-pointer hover:text-blue-300"
                          onClick={() =>
                            router.push(`/workerProfile?id=${worker.id}`)
                          }
                        >
                          {worker.firstName}
                        </td>
                        <td className="px-6 py-4 text-white font-nixie whitespace-nowrap">
                          {worker.lastName}
                        </td>
                        <td className="px-6 py-4 text-white font-nixie whitespace-nowrap">
                          {worker.position}
                        </td>
                        <td className="px-6 py-4 text-white font-nixie whitespace-nowrap">
                          {worker.phoneNumber}
                        </td>
                        <td className="px-6 py-4 text-white whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(worker.id)}
                            className="font-comfortaa font-semibold bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-yellow-300 -ml-2"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="px-6 py-4 text-black whitespace-nowrap">
                          <button
                            onClick={() => handleView(worker.id)}
                            className="font-comfortaa font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors border-2 border-transparent hover:border-blue-300 -ml-2"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {selectedWorker && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto relative">
              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 text-red-600 hover:text-red-800"
              >
                <AiOutlineClose size={24} />
              </button>
              <h2 className="text-2xl font-bold text-black mb-4">
                {selectedWorker.firstName} {selectedWorker.lastName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                <div>
                  <p className="font-semibold">First Name:</p>
                  <p>{selectedWorker.firstName}</p>
                </div>
                <div>
                  <p className="font-semibold">Last Name:</p>
                  <p>{selectedWorker.lastName}</p>
                </div>
                <div>
                  <p className="font-semibold">Position:</p>
                  <p>{selectedWorker.position}</p>
                </div>
                <div>
                  <p className="font-semibold">Phone Number:</p>
                  <p>{selectedWorker.phoneNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold">Address:</p>
                  <p>{selectedWorker.address}</p>
                </div>
                <div>
                  <p className="font-semibold">City:</p>
                  <p>{selectedWorker.city}</p>
                </div>
                <div>
                  <p className="font-semibold">State:</p>
                  <p>{selectedWorker.state}</p>
                </div>
                <div>
                  <p className="font-semibold">Zip Code:</p>
                  <p>{selectedWorker.zipCode}</p>
                </div>
              </div>
              <button
                onClick={() => handleEdit(selectedWorker.id)}
                className="bg-yellow-300 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors mt-4"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="text-white py-1">
        <div className="container mx-auto text-center py-8 w-full">
          <p>&copy; {new Date().getFullYear()} ShiftEaze. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Workers;
