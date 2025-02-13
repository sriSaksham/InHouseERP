import  { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
const LeaveManagementPage = () => {
  interface LeaveRequest {
    id: number;
    employeeId: string | number;
    startDate: string;
    endDate: string;
    leaveType: string;
    status: string;
  }
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState('Sick');
  const [days, setDays] = useState('');
  const [leaveHistory] = useState([
    { id: 1, employeeId: 101, leaveType: 'Casual', startDate: '2024-12-01', endDate: '2024-12-02', status: 'APPROVED' },
    { id: 2, employeeId: 102, leaveType: 'Sick', startDate: '2024-12-10', endDate: '2024-12-12', status: 'REJECTED' },
  ]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axiosInstance.get('/leave/leave-requests');
        setLeaveRequests(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleApprove = async (requestId: string | number) => {
    try {
      await axiosInstance.post(`/leave/approve-leave/${requestId}`);
      setLeaveRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error('Error approving leave request:', error);
      alert('Failed to approve leave request.');
    }
  };

  const handleReject = async (requestId: string | number) => {
    try {
      await axiosInstance.post(`/leave/reject-leave/${requestId}`);
      setLeaveRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      alert('Failed to reject leave request.');
    }
  };

  const handleAddLeave = async () => {
    if (!employeeId || !days) {
      alert('Please provide Employee ID and Number of Days.');
      return;
    }
  
    try {
      const leaveBalanceData = {
        leaveType,
        balance: parseInt(days, 10), // Convert days to a number
      };
  
      const response = await axiosInstance.post(`/leave/${employeeId}/add-leave-balance`, leaveBalanceData);
  
      if (response.status === 200 || response.status === 201) {
        alert('Leave balance added successfully!');
      } else {
        alert('Failed to add leave balance. Please try again.');
      }
    } catch (error) {
      console.error('Error adding leave balance:', error);
      alert('An error occurred while adding leave balance.');
    }
  };
  

  const handleDeductLeave =  async () => {
    if (!employeeId || !days) {
      alert('Please provide Employee ID and Number of Days.');
      return;
    }
  
    try {
      const leaveBalanceData = {
        leaveType,
        balance: parseInt(days, 10), // Convert days to a number
      };
  
      const response = await axiosInstance.post(`/leave/${employeeId}/deduct-leave-balance`, leaveBalanceData);
  
      if (response.status === 200 || response.status === 201) {
        alert('Leave balance added successfully!');
      } else {
        alert('Failed to add leave balance. Please try again.');
      }
    } catch (error) {
      console.error('Error adding leave balance:', error);
      alert('An error occurred while adding leave balance.');
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Leave Management</h2>

      {/* Pending Leave Requests */}
      <h3 className="text-xl font-semibold mb-4">Pending Leave Requests</h3>
  <div className="overflow-x-auto mb-8">
    <table className="min-w-full table-auto bg-white border border-gray-300 shadow-default dark:border-strokedark dark:bg-boxdark">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-4 border-b text-left">Employee ID</th>
          <th className="py-2 px-4 border-b text-left">Employee Name</th>
          <th className="py-2 px-4 border-b text-left">Start Date</th>
          <th className="py-2 px-4 border-b text-left">End Date</th>
          <th className="py-2 px-4 border-b text-left">Apply Date</th>
          <th className="py-2 px-4 border-b text-left">Leave Type</th>
          <th className="py-2 px-4 border-b text-left">Reason</th>
          <th className="py-2 px-4 border-b text-left">Status</th>
          <th className="py-2 px-4 border-b text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {leaveRequests.length > 0 ? (
          leaveRequests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{req.employeeId}</td>
              <td className="py-2 px-4 border-b">{req.empName}</td>
              <td className="py-2 px-4 border-b">{req.startDate}</td>
              <td className="py-2 px-4 border-b">{req.endDate}</td>
              <td className="py-2 px-4 border-b">
                {req.applyDate ? req.applyDate : "N/A"}
              </td>
              <td className="py-2 px-4 border-b">{req.leaveType}</td>
              <td className="py-2 px-4 border-b">
                {req.description ? req.description : "No reason provided"}
              </td>
              <td className="py-2 px-4 border-b">{req.status}</td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => handleApprove(req.id)}
                >
                  Approve
                </button>
                <button
                  className="ml-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleReject(req.id)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={9} className="py-4 text-center text-gray-500">
              No pending leave requests.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>


      {/* Add/Deduct Leave Section */}
      <div className="mb-8 bg-gray-100 p-4 rounded  shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="text-xl font-semibold mb-4">Manage Leave Balance</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            className="border p-2 rounded w-full md:w-1/4"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <select
            className="border p-2 rounded w-full md:w-1/4"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
          </select>
          <input
            type="text"
            className="border p-2 rounded w-full md:w-1/4"
            placeholder="Number of Days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddLeave}
          >
            Add Leave
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleDeductLeave}
          >
            Deduct Leave
          </button>
        </div>
      </div>

      {/* Leave History */}
      {/* <h3 className="text-xl font-semibold mt-6 mb-4">Leave History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Employee ID</th>
              <th className="py-2 px-4 border-b text-left">Leave Type</th>
              <th className="py-2 px-4 border-b text-left">Start Date</th>
              <th className="py-2 px-4 border-b text-left">End Date</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveHistory.map((history) => (
              <tr key={history.id}>
                <td className="py-2 px-4 border-b">{history.employeeId}</td>
                <td className="py-2 px-4 border-b">{history.leaveType}</td>
                <td className="py-2 px-4 border-b">{history.startDate}</td>
                <td className="py-2 px-4 border-b">{history.endDate}</td>
                <td className="py-2 px-4 border-b">{history.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default LeaveManagementPage;
