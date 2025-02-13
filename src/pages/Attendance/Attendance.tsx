import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import axiosInstance from "../../utils/axiosInstance";


type LogData = {
  date: string;
  punchIn: string | null;
  punchOut: string | null;
  effectiveHours: string | null;
};

const AttendancePage: React.FC = () => {
  const [logsData, setLogsData] = useState<LogData[]>([]);
  const [isClockedOut, setIsClockedOut] = useState(true); // Track clock-in/out state
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
  const [employeeId, setEmployeeId] = useState<number | null>();
  const [todayPunchIn, setTodayPunchIn] = useState<string | null>(null); // Today's punch-in time
  const [todayPunchOut, setTodayPunchOut] = useState<string | null>(null);
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log('Stored User ID:', storedUserId);
    if (storedUserId) {
      setEmployeeId(Number(storedUserId));
    } else {
      console.error('User ID not found in localStorage');
    }
  }, []);
  
 
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
  
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1); 
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; 
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' }); 
  
      
      options.push({ value, label });
    }
  
    return options;
  };
  

  const monthOptions = generateMonthOptions();
  
  const fetchLogs = async () => {
    if (!employeeId) {
      console.error("Employee ID is null or undefined. Cannot fetch logs.");
      return;
    }
    try {
      const response = await axiosInstance.get<LogData[]>(`/attendance/monthly-report/${employeeId}`, {
        params: { month: selectedMonth },
      });
      console.log("API Response:", response.data);
  
      const processedData = response.data.map((log: LogData) => ({
        date: log.date,
        punchIn: log.punchIn,
        punchOut: log.punchOut,
        effectiveHours: calculateEffectiveHours(log.punchIn, log.punchOut),
      }));
  
      setLogsData(processedData);
  
      // Generate today's date in "YYYY-MM-DD" format
      const today = new Date().toISOString().slice(0, 10);
      const todayLogs = processedData.filter((log) => log.date === today);
  
      if (todayLogs.length === 0) {
        setIsClockedOut(true); // No record, show clock-in
        setTodayPunchIn(null);
        setTodayPunchOut(null);
      } else {
        // Sort logs by punchIn time to get the latest log
        const latestLog = todayLogs.sort(
          (a, b) => new Date(b.punchIn!).getTime() - new Date(a.punchIn!).getTime()
        )[0];
  
        if (latestLog.punchIn && !latestLog.punchOut) {
          setIsClockedOut(false); // Punch-in exists, punch-out is pending
        } else {
          setIsClockedOut(true); // Record complete, allow new clock-in
        }
  
        // Update today's punch-in and punch-out times
        setTodayPunchIn(latestLog.punchIn || null);
        setTodayPunchOut(latestLog.punchOut || null);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };
  
  useEffect(() => {
    if (employeeId) {
      fetchLogs();
    }
  }, [selectedMonth, employeeId]);
  
  
  useEffect(() => {
    console.log("Updated Selected Month:", selectedMonth);
  }, [selectedMonth]);
  
  // Calculate Effective Hours
  const calculateEffectiveHours = (punchIn: string | null, punchOut: string | null) => {
    if (!punchIn || !punchOut) return "N/A";
    const inTime = new Date(punchIn);
    const outTime = new Date(punchOut);
    const diff = outTime.getTime() - inTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="attendance-page p-6">
      <Breadcrumb pageName="Attendance" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <AttendanceStats
          isClockedOut={isClockedOut}
          todayPunchIn={todayPunchIn}
          todayPunchOut={todayPunchOut}
        />
        <Timings />
        <Actions isClockedOut={isClockedOut} setIsClockedOut={setIsClockedOut} fetchLogs={fetchLogs} employeeId={employeeId ?? null} />
      </div>
      <div className="mb-4 mt-6 flex items-center">
            <label htmlFor="month" className="font-semibold mr-2">Select Month:</label>
            <select
    id="month"
    value={selectedMonth}
    onChange={(e) => {
      console.log("Dropdown Value Changed:", e.target.value); // Log the selected value
      setSelectedMonth(e.target.value); // Correctly update the selectedMonth state
    }}
    className="form-select border rounded p-2"
  >
    {monthOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
           
        </div>
      <LogsRequests data={logsData} />
    </div>
  );
};

const LogsRequests: React.FC<{ data: LogData[] }> = ({ data }) => {
  // Function to format timestamps
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return "N/A";
    const time = new Date(dateTime);
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="logs-requests mt-6">
      <h3 className="font-semibold text-lg">Logs & Requests</h3>
      <table className="w-full border-collapse mt-4">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Punch In</th>
            <th className="text-left p-2">Punch Out</th>
            <th className="text-left p-2">Effective Hours</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{item.date}</td>
              <td className="p-2">{formatTime(item.punchIn)}</td>
              <td className="p-2">{formatTime(item.punchOut)}</td>
              <td className="p-2">{item.effectiveHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AttendanceStats: React.FC<{ isClockedOut: boolean; todayPunchIn: string | null; todayPunchOut: string | null }> = ({
  isClockedOut,
  todayPunchIn,
  todayPunchOut,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0); // Time in seconds
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedClockInTime = localStorage.getItem("clockInTime");

    if (!isClockedOut && storedClockInTime) {
      // Calculate the elapsed time since clock-in
      const clockInTime = new Date(storedClockInTime).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - clockInTime) / 1000);
      setElapsedTime(elapsedSeconds);

      // Start the timer
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
    } else {
      // Clear the timer if not clocked in
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    }

    return () => {
      // Cleanup interval on component unmount
      if (timer) clearInterval(timer);
    };
  }, [isClockedOut]);

 
  // Format elapsed time in HH:mm:ss
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // Format time (e.g., 02:15 PM)
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return 'N/A';
    const time = new Date(dateTime);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="attendance-stats rounded border p-4 shadow">
      <h3 className="font-semibold text-lg">Attendance Stats</h3>
      <div className="flex justify-between items-center mt-4">
        {/* Elapsed Time on the left */}
        <div>
          <p className="text-sm text-center">Timer</p>
          <h4 className="text-2xl font-bold text-center">{formatElapsedTime(elapsedTime)}</h4>
        </div>
        {/* Punch In and Punch Out on the right */}
        <div className="flex flex-col items-end gap-2">
          <div>
            <p className="text-sm text-right">Clock-In Time</p>
            <h4 className="text-lg font-medium text-right">{formatTime(todayPunchIn)}</h4>
          </div>
          <div>
            <p className="text-sm text-right">Clock-Out Time</p>
            <h4 className="text-lg font-medium text-right">{formatTime(todayPunchOut)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};


const Timings: React.FC = () => {
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);

  useEffect(() => {
    const todayIndex = new Date().getDay();
    setCurrentDayIndex(todayIndex);
  }, []);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="timings rounded border p-4 shadow">
      <h3 className="font-semibold text-lg">Timings</h3>
      <div className="day-calendar mt-2 flex justify-between items-center">
        <div className="flex space-x-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                currentDayIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p>Today (Flexible Timings)</p>
        <div className="bg-blue-500 h-2 mt-1 rounded"></div>
        <div className="flex justify-between text-sm mt-1">
          <p>Duration: 23h 59m</p>
          <p>Break: 0 Min</p>
        </div>
      </div>
    </div>
  );
};

const Actions: React.FC<{ isClockedOut: boolean; setIsClockedOut: React.Dispatch<React.SetStateAction<boolean>>; employeeId: number | null; fetchLogs: () => Promise<void>; }> = ({
  isClockedOut,
  setIsClockedOut,
  employeeId,
  fetchLogs,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusMessage, setStatusMessage] = useState('');
  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockToggle = async () => {
    if (isClockedOut) {
      try {
        await axiosInstance.post(`/attendance/punch-in/${employeeId}`);
        localStorage.setItem("clockInTime", currentTime.toISOString());
        setStatusMessage(`Clocked In Successfully `);
        setIsClockedOut(false);
        await fetchLogs();
      }  catch (error: any) {
        if (error.response) {
          const statusCode = error.response.status;
          const serverMessage = error.response.data.errorMessage;
  
          if (statusCode === 400) {
            if (serverMessage === "Employee has already punched in for today.") {
              setStatusMessage("You have already punched in for today.");
            } else {
              setStatusMessage("Bad Request. Please check your input.");
            }
          } else if (statusCode === 500) {
            setStatusMessage("Server error. Please try again later.");
          } else {
            setStatusMessage("Failed to Clock In. Please try again.");
          }
        } else {
          setStatusMessage("Failed to Clock In. Please try again.");
        }
        console.error("Error during punch-in:", error);
      }
    } else {
      try {
         await axiosInstance.post(`/attendance/punch-out/${employeeId}`);
        localStorage.removeItem("clockInTime");
        setStatusMessage(`Clocked Out Successfully `);
        setIsClockedOut(true);
        await fetchLogs();
      } catch (error) {
        console.error('Error during punch-out:', error);
        setStatusMessage('Failed to Clock Out. Please try again.');
      }
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="actions rounded border p-4 shadow">
      <h3 className="font-semibold text-lg">Actions</h3>
      <div className="mt-2">
        <p className="text-lg font-medium">{currentTime.toLocaleTimeString()}</p>
        <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
        <button
          onClick={handleClockToggle}
          className={`py-2 px-4 rounded mt-2 ${
            isClockedOut ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {isClockedOut ? 'Web Clock-In' : 'Web Clock-Out'}
        </button>
        <p className="text-sm mt-1">{statusMessage}</p>
      </div>
    </div>
  );
};

export default AttendancePage;
