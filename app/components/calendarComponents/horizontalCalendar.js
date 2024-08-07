"use client";
import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parse } from 'date-fns';
import CalendarGrid from './calendarGrid';
import ScheduleBlockCreator from './scheduleBlockCreator';
import WorkersDisplay from './workersDisplay';
import { WorkersProvider, useWorkers } from './workersContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AiOutlineDownload, AiOutlineUpload } from 'react-icons/ai';
import * as XLSX from 'xlsx';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { firebaseApp } from 'utils/firebase';
import { useSearchParams } from 'next/navigation';

const HorizontalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [mode, setMode] = useState('admin');
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const hideButtonTimeout = useRef(null);
  const { workers } = useWorkers();
  const topGridRef = useRef(null);
  const bottomGridRef = useRef(null);
  const searchParams = useSearchParams();

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'worker') {
      setMode('worker');
    } else if (view === 'admin') {
      setMode('admin');
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedJobTitle) {
      loadBlocksForCurrentMonthAndJobTitle(selectedJobTitle);
    }
  }, [currentDate, selectedJobTitle]);

  const handleTopScroll = () => {
    if (topGridRef.current && bottomGridRef.current) {
      const scrollLeft = topGridRef.current.scrollLeft;
      bottomGridRef.current.scrollTo({ left: scrollLeft });
    }
  };

  const handleBottomScroll = () => {
    if (topGridRef.current && bottomGridRef.current) {
      const scrollLeft = bottomGridRef.current.scrollLeft;
      topGridRef.current.scrollTo({ left: scrollLeft });
    }
  };

  useEffect(() => {
    if (topGridRef.current) {
      topGridRef.current.addEventListener("scroll", handleTopScroll);
    }
    if (bottomGridRef.current) {
      bottomGridRef.current.addEventListener("scroll", handleBottomScroll);
    }
    return () => {
      if (topGridRef.current) {
        topGridRef.current.removeEventListener("scroll", handleTopScroll);
      }
      if (bottomGridRef.current) {
        bottomGridRef.current.removeEventListener("scroll", handleBottomScroll);
      }
    };
  }, [topGridRef, bottomGridRef]);

  const handleDateClick = (date) => {
    setSelectedDate((prevDate) =>
      prevDate && format(date, "yyyy-MM-dd") === format(prevDate, "yyyy-MM-dd")
        ? null
        : date
    );
  };

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  }).slice(0, 31);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const addBlockToGrid = (newBlock) => {
    setBlocks((prevBlocks) => {
      const updatedBlocks = [...prevBlocks, newBlock];
      saveBlockToFirebase(newBlock);
      return updatedBlocks;
    });
  };

  const deleteBlock = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const managerDocRef = mode === 'worker' ? doc(db, 'managers', searchParams.get('managerId')) : doc(db, 'managers', user.uid);
      const scheduleCollectionRef = collection(managerDocRef, 'schedule');
      const querySnapshot = await getDocs(scheduleCollectionRef);

      querySnapshot.forEach(async (doc) => {
        if (doc.data().id === id) {
          await deleteDoc(doc.ref);
        }
      });

      setBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.filter((block) => block.id !== id);
        return updatedBlocks;
      });
    } catch (error) {
      console.error("Error deleting block: ", error);
    }
  };

  const moveBlock = async (id, row, col) => {
    setBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks.map((block) =>
        block.id === id
          ? {
              ...block,
              row,
              startDate: new Date(
                block.startDate.getFullYear(),
                block.startDate.getMonth(),
                col + 1
              ),
              endDate: new Date(
                block.endDate.getFullYear(),
                block.endDate.getMonth(),
                col + block.endDate.getDate() - block.startDate.getDate() + 1
              ),
            }
          : block
      );
      saveBlockToFirebase(updatedBlocks.find(block => block.id === id));
      return updatedBlocks;
    });
  };

  const saveBlockToFirebase = async (block) => {
    const user = auth.currentUser;
    if (!user) return;

    const managerDocRef = mode === 'worker' ? doc(db, 'managers', searchParams.get('managerId')) : doc(db, 'managers', user.uid);
    const scheduleCollectionRef = collection(managerDocRef, 'schedule');

    try {
      const querySnapshot = await getDocs(scheduleCollectionRef);
      let docRef = null;
      querySnapshot.forEach((doc) => {
        if (doc.data().id === block.id) {
          docRef = doc.ref;
        }
      });

      if (docRef) {
        await updateDoc(docRef, {
          ...block,
          startDate: block.startDate.toISOString(),
          endDate: block.endDate.toISOString(),
        });
      } else {
        await addDoc(scheduleCollectionRef, {
          ...block,
          startDate: block.startDate.toISOString(),
          endDate: block.endDate.toISOString(),
        });
      }
    } catch (error) {
      console.error("Error saving block to Firebase: ", error);
    }
  };

  const loadBlocksForCurrentMonthAndJobTitle = async (jobTitle) => {
    const user = auth.currentUser;
    if (!user) return;

    const managerDocRef = mode === 'worker' ? doc(db, 'managers', searchParams.get('managerId')) : doc(db, 'managers', user.uid);
    const scheduleCollectionRef = collection(managerDocRef, 'schedule');

    try {
      const querySnapshot = await getDocs(scheduleCollectionRef);
      const blocks = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((block) => block.jobTitle === jobTitle && block.startDate.startsWith(format(currentDate, 'yyyy-MM')))
        .map((block) => ({
          ...block,
          startDate: new Date(block.startDate),
          endDate: new Date(block.endDate),
        }));
      setBlocks(blocks);
    } catch (error) {
      console.error("Error loading blocks from Firebase: ", error);
    }
  };

  const exportToExcel = () => {
    const formatTime = (time) => {
      const [hour, minute] = time.split(':');
      const date = new Date(0, 0, 0, hour, minute);
      return format(date, 'h:mm a');
    };

    const data = blocks.map(block => {
      return {
        DisplayRow: block.row + 1,
        ProfilePicture: block.employee.photoURL ? block.employee.photoURL : 'None',
        FirstName: block.employee.firstName,
        LastName: block.employee.lastName,
        BlockType: block.type,
        StartTime: block.type !== 'Vacation Block' ? formatTime(block.startTime) : 'Not Applicable',
        EndTime: block.type !== 'Vacation Block' ? formatTime(block.endTime) : 'Not Applicable',
        StartDate: format(new Date(block.startDate), 'MMMM d, yyyy'),
        EndDate: format(new Date(block.endDate), 'MMMM d, yyyy'),
        GridRow: block.row + 1
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');

    const fileName = `${selectedJobTitle}-${format(currentDate, 'dd-MMMM-yyyy')}-Schedule.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parseTime = (time) => {
        if (time === 'Not Applicable') return null;
        const date = parse(time, 'h:mm a', new Date());
        return format(date, 'HH:mm');
      };

      if (validateImportedData(jsonData)) {
        const importedBlocks = jsonData.map(item => ({
          id: `${Date.now()}-${item.GridRow}`,
          type: item.BlockType,
          startDate: parse(item.StartDate, 'MMMM d, yyyy', new Date()),
          endDate: parse(item.EndDate, 'MMMM d, yyyy', new Date()),
          startTime: parseTime(item.StartTime),
          endTime: parseTime(item.EndTime),
          employee: {
            firstName: item.FirstName,
            lastName: item.LastName,
            photoURL: item.ProfilePicture !== 'None' ? item.ProfilePicture : null
          },
          row: item.GridRow - 1
        }));

        const uniqueBlocks = importedBlocks.map(block => ({
          ...block,
          id: `${block.id}-${Math.random()}`
        }));

        setBlocks((prevBlocks) => {
          const updatedBlocks = [...prevBlocks, ...uniqueBlocks];
          saveBlocksToFirebase(updatedBlocks);
          return updatedBlocks;
        });
      } else {
        alert('Invalid file format. Please upload a valid schedule spreadsheet.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateImportedData = (data) => {
    const requiredColumns = ['DisplayRow', 'ProfilePicture', 'FirstName', 'LastName', 'BlockType', 'StartTime', 'EndTime', 'StartDate', 'EndDate', 'GridRow'];
    return data.every(item => requiredColumns.every(column => item.hasOwnProperty(column)));
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (
        e.clientY > window.innerHeight - 150 &&
        e.clientX > window.innerWidth - 150
      ) {
        setIsButtonVisible(true);
        if (hideButtonTimeout.current) {
          clearTimeout(hideButtonTimeout.current);
        }
        hideButtonTimeout.current = setTimeout(() => {
          setIsButtonVisible(false);
        }, 4000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideButtonTimeout.current) {
        clearTimeout(hideButtonTimeout.current);
      }
    };
  }, []);

  return (
    <WorkersProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="flex">
          <WorkersDisplay />
          <div className="w-full max-w-[1500px] border border-gray-300 overflow-hidden bg-white mb-5 mx-auto">
            <div className="flex justify-between items-center bg-white text-gray-800 p-2">
              <button
                className="font-comfortaa font-semibold bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-700 ml-5 border-2 border-transparent hover:border-blue-400"
                onClick={handlePrevMonth}
              >
                Previous Month
              </button>
              <h2 className="text-3xl font-bold mx-auto text-blue-600">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <button
                className="font-comfortaa font-semibold bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-700 border-2 border-transparent hover:border-blue-400"
                onClick={handleNextMonth}
              >
                Next Month
              </button>
              {mode === 'admin' && (
                <>
                  <button
                    className="font-comfortaa font-semibold flex items-center bg-orange-500 text-white px-1 py-1 rounded-lg hover:bg-orange-600 ml-5 border-2 border-transparent hover:border-orange-400"
                    onClick={exportToExcel}
                  >
                    Excel Export
                    <AiOutlineUpload size={24} />
                  </button>
                  <label
                    className="font-comfortaa font-semibold flex items-center bg-orange-500 text-white px-1 py-1 rounded-lg hover:bg-orange-600 ml-5 cursor-pointer border-2 border-transparent hover:border-orange-400"
                  >
                    Excel Import
                    <AiOutlineDownload size={24} />
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>

            <ScheduleBlockCreator
              addBlockToGrid={addBlockToGrid}
              existingBlocks={blocks}
              currentMonth={currentDate}
              mode={mode}
              selectedJobTitle={selectedJobTitle}
              setSelectedJobTitle={setSelectedJobTitle}
              setBlocks={setBlocks}
              workers={workers}
            />

            <div
              className="font-comfortaa font-semibold grid grid-cols-[repeat(31,80px)] bg-gray-100 text-blue-600 text-center font-bold overflow-x-auto container-with-scrollbar"
              ref={topGridRef}
              onScroll={handleTopScroll}
            >
              {daysInMonth.map((date, i) => (
                <div
                  key={i}
                  className={`relative w-[80px] h-[80px] flex flex-col justify-center items-center border border-gray-300 cursor-pointer hover:bg-blue-200 hover:text-blue-800 ${
                    selectedDate &&
                    format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                      ? "bg-blue-800 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <p className="m-0 text-lg font-bold">{daysOfWeek[date.getDay()]}</p>
                  <p className="m-0 text-lg font-bold">{format(date, "d")}</p>
                  {selectedDate &&
                    format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                    )}
                </div>
              ))}
            </div>

            <div
              className="overflow-x-auto relative container-with-scrollbar"
              ref={bottomGridRef}
              onScroll={handleBottomScroll}
            >
              <CalendarGrid
                blocks={blocks}
                selectedDate={selectedDate}
                topGridRef={topGridRef}
                moveBlock={moveBlock}
                deleteBlock={deleteBlock}
                updateBlock={(id, startDate, endDate) => {
                  const updatedBlocks = blocks.map((block) =>
                    block.id === id ? { ...block, startDate, endDate } : block
                  );
                  setBlocks(updatedBlocks);
                  saveBlockToFirebase(updatedBlocks.find(block => block.id === id));
                }}
                mode={mode}
              />
            </div>
          </div>
        </div>
      </DndProvider>
    </WorkersProvider>
  );
};

export default HorizontalCalendar;
