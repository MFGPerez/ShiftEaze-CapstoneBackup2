"use client";

import React, { useState, useEffect, Suspense } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, getDocs, addDoc, Timestamp, where } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { firebaseApp } from "utils/firebase";
import { TextField, Button, Box, Typography } from "@mui/material";
import SupportNavBar from "@/components/faqsContactManagerNavBar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";

// Custom styled-components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #93c5fd, #2563eb, #1e40af);
  color: white;
`;

const Content = styled.div`
  background: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  margin: 20px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
`;

const ButtonStyled = styled(Button)`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

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

const RequestLeaveComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const user = auth.currentUser;

  const [selectedDates, setSelectedDates] = useState([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [managerId, setManagerId] = useState("");
  const [workerName, setWorkerName] = useState("");

  useEffect(() => {
    const fetchWorkerData = async () => {
      if (!user) {
        console.error("User not signed in");
        return;
      }

      try {
        const managersQuery = query(collection(db, "managers"));
        const managersSnapshot = await getDocs(managersQuery);

        for (const managerDoc of managersSnapshot.docs) {
          const workersQuery = query(
            collection(db, "managers", managerDoc.id, "workers"),
            where("email", "==", user.email)
          );
          const workersSnapshot = await getDocs(workersQuery);
          if (!workersSnapshot.empty) {
            const workerData = workersSnapshot.docs[0].data();
            setManagerId(managerDoc.id);
            setWorkerName(`${workerData.firstName} ${workerData.lastName}`);
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching worker data: ", error);
      }
    };

    fetchWorkerData();
  }, [auth, db, user]);

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending request...");

    try {
      await addDoc(collection(db, "leaveRequests"), {
        workerName: workerName,
        email: user.email,
        managerId: managerId,
        notes: notes,
        selectedDates: selectedDates.map(date => Timestamp.fromDate(date)),
        timestamp: Timestamp.now(),
      });
      setStatus("Leave request sent successfully.");
      setSelectedDates([]);
      setNotes("");
    } catch (error) {
      setStatus("Error sending leave request: " + error.message);
    }
  };

  return (
    <>
      <SupportNavBar />
      <Container>
        <Content>
          <Title>Select Dates for Leave</Title>
          <CustomCalendar
            onChange={handleDateChange}
            selectRange
            value={selectedDates}
            className="mb-6 react-calendar--large custom-calendar mt-12"
          />
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Box>
              <TextField
                label="Reason for Leave Request"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={4}
                fullWidth
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                InputProps={{
                  style: { color: "black" },
                }}
                InputLabelProps={{
                  style: { color: "black" },
                }}
              />
            </Box>
            <Box>
              <ButtonStyled
                type="submit"
                variant="contained"
                color="primary"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-3 px-6 transition-colors border-2 border-transparent hover:border-blue-300"
              >
                Send Leave Request
              </ButtonStyled>
            </Box>
          </form>
          {status && (
            <Typography className="text-black mt-4">{status}</Typography>
          )}
        </Content>
      </Container>
    </>
  );
};

const RequestLeave = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RequestLeaveComponent />
  </Suspense>
);

export default RequestLeave;
