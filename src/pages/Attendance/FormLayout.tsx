import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Calendar as FullCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { SlotInfo } from 'react-big-calendar';
import axiosInstance from "../../utils/axiosInstance";


const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [view, setView] = useState<string>('month'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    description: '',
  });
  type LeaveBalance = {
    balance: number;
  };
  
  type LeaveBalances = {
    Sick?: LeaveBalance;
    Casual?: LeaveBalance;
    [key: string]: LeaveBalance | undefined;
  };
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalances>({});

  const employeeId = localStorage.getItem('userId');
  const [approvedRejectedRequests, setApprovedRejectedRequests] = useState<CalendarEvent[]>([]);
  type CalendarEvent = {
    title: string;
    start: Date;
    end: Date;
    status?: string;
  };
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState<CalendarEvent[]>([]); 
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await axiosInstance.get(`/leave/${employeeId}/leave-balances`);
        const leaveData = response.data.reduce((acc: Record<string, any>, leave: any) => {
          acc[leave.leaveType] = leave;
          return acc;
        }, {} as Record<string, any>);
        setLeaveBalances(leaveData);
      } catch (error) {
        console.error('Error fetching leave balances:', error);
      }
    };

    fetchLeaveBalances();
  }, [employeeId]);

  // Fetch pending leave requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get(`/leave/leave-request/${employeeId}`);
        const events = response.data.map((request: any) => ({
          title: request.leaveType, // Event title from leave type
          start: new Date(request.startDate), // Start date of the leave
          end: new Date(request.endDate), // End date of the leave
          status: "PENDING",
        }));
        setPendingRequests(events); 
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, [employeeId]);
  const handleDateClick = (slotInfo: SlotInfo) => {
    const currentDate = moment().startOf("day"); // Current date (without time)
    const selectedStartDate = moment(slotInfo.start).startOf("day"); // Selected start date
    const selectedEndDate = moment(slotInfo.end).startOf("day"); // Selected end date
  
    // Ensure the selected start date is not before the current date
    if (selectedStartDate.isBefore(currentDate)) {
      setErrors((prev) => ({
        ...prev,
        startDate: "Start date cannot be before today's date.",
      }));
      return;
    } else {
      setErrors((prev) => ({ ...prev, startDate: "" })); // Clear error if valid
    }
  
    // Update formData with the valid dates
    setFormData({
      ...formData,
      startDate: selectedStartDate.format("YYYY-MM-DD"),
      endDate: selectedEndDate.format("YYYY-MM-DD"),
    });
  
    setModalOpen(true); // Open the modal
  };
  

  const [errors, setErrors] = useState({
    startDate: "",
    endDate: "",
    serverError: "",
  });
  
  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
  
    if (name === "startDate") {
      const currentDate = moment().format("YYYY-MM-DD");
  
      // Prevent setting a start date before the current date
      if (moment(value).isBefore(currentDate)) {
        setErrors((prev) => ({ ...prev, startDate: "Start date cannot be before today's date." }));
        return;
      } else {
        setErrors((prev) => ({ ...prev, startDate: "" })); // Clear error message
      }
  
      // Adjust endDate if startDate changes
      setFormData((prev) => ({
        ...prev,
        startDate: value,
        endDate: moment(value).isAfter(prev.endDate) ? value : prev.endDate,
      }));
    } else if (name === "endDate") {
      // Ensure endDate is not before startDate
      if (moment(value).isBefore(formData.startDate)) {
        setErrors((prev) => ({ ...prev, endDate: "End date cannot be before the start date." }));
        return;
      } else {
        setErrors((prev) => ({ ...prev, endDate: "" })); // Clear error message
      }
  
      setFormData((prev) => ({
        ...prev,
        endDate: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  useEffect(() => {
  const fetchLeaveHistory = async () => {
    try {
      const response = await axiosInstance.get(`/leave/${employeeId}/leave-history`);
      const events = response.data.map((request: any) => ({
        title: request.leaveType,
        start: new Date(request.startDate),
        end: new Date(request.endDate),
        status: request.status, 
      }));
      setApprovedRejectedRequests(events);
      setLeaveHistory(response.data);
    } catch (error) {
      console.error('Error fetching leave history:', error);
    }
  };
  fetchLeaveHistory();
}, [employeeId]);

  const eventPropGetter = (event: CalendarEvent) => {
    let backgroundColor = "";
    if (event.status === "APPROVED") {
      backgroundColor = "green";
    } else if (event.status === "REJECTED") {
      backgroundColor = "red";
    } else if (event.status === "PENDING") {
      backgroundColor = "blue";
    }
    return { style: { backgroundColor } };
  };
  
  
  const handleApplyLeave = async () => {
    try {
      const response = await axiosInstance.post(
        `/leave/${employeeId}/apply-leave`,
        formData
      );
      console.log('Leave applied successfully:', response.data);
      setModalOpen(false); // Close modal after successful submission
      setErrors({ startDate: "", endDate: "", serverError: "" }); // Clear errors
    } catch (error: any) {
      console.error('Error applying leave:', error);
  
      // Display error message in UI
      if (error.response && error.response.data && error.response.data.errorMessage) {
        setErrors((prev) => ({
          ...prev,
          serverError: error.response.data.errorMessage, // Capture server error
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          serverError: "An unexpected error occurred. Please try again.",
        }));
      }
    }
  };
  
  const highlightCurrentDate = (date: Date) => {
    const currentDate = moment().startOf("day").toDate(); // Get today's date
    if (moment(date).isSame(currentDate, "day")) {
      return {
        style: {
          backgroundColor: "#FFD700", // Golden yellow background
          color: "#000", // Black text
        },
      };
    }
    return {};
  };
  return (
    <div className="calendar-page p-6 ">
      <Breadcrumb pageName="Leave Request" />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl">
          <span className="font-semibold">Sick Leave Balance:</span>{" "}
          <span className="text-blue-500 font-bold">
            {leaveBalances.Sick?.balance || 0} Days
          </span>
          &nbsp;&nbsp;
          <span className="font-semibold">Causal Leave Balance:</span>{" "}
          <span className="text-red-500 font-bold">
            {leaveBalances.Casual?.balance || 0} Days
          </span>
        </div>
        <div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded mr-2" >
            Apply Leave
          </button>
          <button className="px-4 py-2 bg-gray-300 text-black rounded"
            onClick={() => {
            setHistoryModalOpen(true); // Open Leave History Modal
            }}
           >
            Leave History
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full mb-6">
        <FullCalendar
           localizer={localizer}
           events={[...pendingRequests, ...approvedRejectedRequests]}
           startAccessor="start"
           endAccessor="end"
           titleAccessor="title"
           views={["month", "week", "day"]}
           onView={(newView) => setView(newView)}
           onSelectSlot={handleDateClick}
           selectable
           style={{ height: 700, zIndex: 1 }}
           dayPropGetter={highlightCurrentDate}
           eventPropGetter={eventPropGetter}
        />
      </div>

      {/* Legend Section */}
      <div className="w-full bg-gray-100 p-4 rounded shadow">
        <ul className="flex justify-center space-x-8">
          <li className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            Approved
          </li>
          <li className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            Pending
          </li>
          <li className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            Rejected
          </li>
         
        </ul>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Apply Leave</h2>
            {errors.serverError && (
              <p className="text-red-500 text-sm mb-4">{errors.serverError}</p>
            )}
            <div className="mb-4">
              <label className="block mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleFormChange}
                className="border border-gray-300 rounded w-full p-2"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleFormChange}
                className="border border-gray-300 rounded w-full p-2"
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1">Leave Type</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleFormChange}
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Leave Type</option>
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Reason</label>
              <textarea
               name="description" // Match the backend key
               value={formData.description}
                onChange={handleFormChange}
                className="border border-gray-300 rounded w-full p-2"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded mr-2"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleApplyLeave}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {historyModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 1050 }}>
    <div className="bg-white p-6 rounded shadow-lg w-[60vw] max-h-[80vh] overflow-auto">
      <h2 className="text-lg font-bold mb-4">Leave History</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Start Date</th>
            <th className="border border-gray-300 px-4 py-2">End Date</th>
            <th className="border border-gray-300 px-4 py-2">Leave Type</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Apply Date</th>
          </tr>
        </thead>
        <tbody>
          {leaveHistory.map((history: any, index: number) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                {moment(history.startDate).format("YYYY-MM-DD")}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {moment(history.endDate).format("YYYY-MM-DD")}
              </td>
              <td className="border border-gray-300 px-4 py-2">{history.leaveType}</td>
              <td className="border border-gray-300 px-4 py-2">{history.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                {history.applyDate ? moment(history.applyDate).format("YYYY-MM-DD") : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded"
          onClick={() => setHistoryModalOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
  
};

export default CalendarPage;
