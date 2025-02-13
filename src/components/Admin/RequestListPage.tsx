import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Request, RequestItem } from '../../types/request';

const RequestListPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequestItems, setSelectedRequestItems] = useState<RequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedSiteName, setSelectedSiteName] = useState<string | null>(null); // New State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<boolean>(false);
  const [popupType, setPopupType] = useState<'approve' | 'decline' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
  const [, setRequesterUserId] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState<string | null>(null); // For requester name
  const [errorBanner, setErrorBanner] = useState<string | null>(null);



  const navigate = useNavigate();

  

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get('/inventory/master-requests?status=PENDING');
        console.log('Raw Response Data:', response.data);
  
        const mappedRequests: Request[] = response.data.map((req: any) => ({
          requestId: req.id.toString(),
          status: req.approved ? 'Approved' : req.declined ? 'Declined' : 'Pending',

          items: req.requestIds.map((id: number) => ({
            id: id.toString(),
            name: `Item ${id}`,
            requestedQuantity: 1,
            unit: 'N/A',
          })),
          
        }));
  
        setRequests(mappedRequests);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message;
        alert(errorMessage); // Display error as alert
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const addBranch = async () => {
    if (!newBranchName.trim()) {
      alert('Branch name cannot be empty.');
      return;
    }

    try {
      const response = await axiosInstance.post('/branches/create', { name: newBranchName });
      setBranches([...branches, response.data]);
      setNewBranchName('');
      setShowBranchModal(false);
      alert('Branch added successfully.');
      window.location.reload();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add branch. Please try again.';
      alert(errorMessage); // Display error as alert
    }
  };

  

  const viewRequestItems = async (requestId: string) => {
    try {
      setViewingRequest(true);
      const response = await axiosInstance.get(`/inventory/master-requests/${requestId}`, {
        params: { approved: false }, // Explicitly pass approved=false
      });
      console.log('Request Details Response:', response.data);

      const items = response.data.materialRequestDTOList.map((item: any) => ({
        id: item.materialId.toString(),
        materialId: item.materialId,
        requestedQuantity: item.requestedQuantity,
        requestDate: item.requestDate,
        siteId: item.siteId,
        materialName: item.materialName,
        materialDescription: item.materialDescription,
        requesterName: item.requesterName,
        reasonForRequest: item.reasonForRequest,

      }));

      setSelectedRequestItems(items);
      setSelectedSiteName(response.data.siteName || 'N/A'); // Set siteName
      setRequesterName(response.data.requesterName || 'Unknown');


      if (response.data.materialRequestDTOList.length > 0) {
        setRequesterUserId(response.data.materialRequestDTOList[0].requesterUserId.toString());

      } else {
        setRequesterUserId(null);
      }
      setSelectedRequestId(requestId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ;
      alert(errorMessage); // Display error as alert
    } finally {
      setViewingRequest(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequestId) return;
    try {
      setIsProcessing(true);
      const approverUserId = localStorage.getItem("userId");
      if (!approverUserId) {
        alert("Approver ID not found. Please log in again.");
        return;
      }
  
    
      const response = await axiosInstance.post(
        `/inventory/approve-request/${selectedRequestId}`,
        null,
        {
          params: {
            approverUserId,
            status: "APPROVED",
          },
        }
      );
  
      console.log("Approve Response:", response.data);
      alert(response.data);
  
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.requestId !== selectedRequestId)
      );
      setErrorBanner(null);
    } catch (err: any) {
      if (err.response) {
        const backendData = err.response.data;
    if (backendData && backendData.errorMessage) {
      setErrorBanner(backendData.errorMessage);  
    } else if (typeof backendData === 'string') {
      setErrorBanner(backendData);
    } else {
      setErrorBanner('An unexpected error occurred.');
    }
  } else {
    setErrorBanner('Failed to connect to server.');
  }
      
    } finally {
      setIsProcessing(false);
      setPopupType(null);
    }
  };
  

  const handleDecline = async () => {
    if (!selectedRequestId) return;
    try {
      setIsProcessing(true);
      const approverUserId = localStorage.getItem("userId");
      if (!approverUserId) {
        alert("Approver ID not found. Please log in again.");
        return;
      }
  
      const response = await axiosInstance.post(
        `/inventory/approve-request/${selectedRequestId}?approverUserId=${approverUserId}&status=REJECTED`
      );
      console.log("Decline Response:", response.data);
  
      alert("Request declined successfully.");
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.requestId !== selectedRequestId)
      );
    } catch (err: any) {
      if (err.response) {
        const backendData = err.response.data;
    if (backendData && backendData.errorMessage) {
      setErrorBanner(backendData.errorMessage);  
    } else if (typeof backendData === 'string') {
      setErrorBanner(backendData);
    } else {
      setErrorBanner('An unexpected error occurred.');
    }
  } else {
    setErrorBanner('Failed to connect to server.');
  }
      
    } finally {
      setIsProcessing(false);
      setPopupType(null);
    }
  };

  const openPopup = (type: 'approve' | 'decline', requestId: string) => {
    setPopupType(type);
    setSelectedRequestId(requestId);
  };

  const closePopup = () => {
    setPopupType(null);
    setSelectedRequestId(null);
  };
  const closeDetailsModal = () => {
    setSelectedRequestItems([]);
    setSelectedRequestId(null);
    setRequesterUserId(null);
    setSelectedSiteName(null); 
    setRequesterName(null);

  };
  if (loading) {
    return <div>Loading requests...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  return (<div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
      Admin
    </h4>
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Request List</h2>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowBranchModal(true)}
          className="ml-2 px-4 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          Add Branch
        </button>
         <button
          onClick={() => navigate('/admin/approvedRequests')}    
          className="mr-2 px-4 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          Approved Requests
        </button>
      </div>

      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Branch</h2>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Enter branch name"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={addBranch}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
              >
                Add Branch
              </button>
              <button
                onClick={() => setShowBranchModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
{errorBanner && (
  <div className="bg-red-500 text-white p-4 rounded mb-4">
    {errorBanner}
  </div>
)}
      

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border border-gray-300  dark:border-strokedark dark:bg-boxdark">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Request ID</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
          {requests.map((req, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{req.requestId}</td>
                <td className="py-2 px-4 border-b">{req.status}</td>
                <td className="py-2 px-4 border-b text-center">
                <button
                    onClick={() => viewRequestItems(req.requestId)}
                    className="ml-2 px-4 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition duration-200 shadow-default dark:border-strokedark dark:bg-boxdark"
                    disabled={viewingRequest}
                  >
                    {viewingRequest && req.requestId === selectedRequestId
                      ? 'Loading...'
                      : 'Details'}
                  </button>
                  <button
                    onClick={() => openPopup('approve', req.requestId)}
                    className="ml-2 px-4 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition duration-200 shadow-default dark:border-strokedark dark:bg-boxdark"
                    >
                    Approve
                  </button>
                  <button
                    onClick={() => openPopup('decline', req.requestId)}
                    className="ml-2 px-4 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition duration-200 shadow-default dark:border-strokedark dark:bg-boxdark"
                    >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {popupType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">
              {popupType === 'approve'
                ? 'You’re about to approve the request'
                : 'You’re about to decline the request'}
            </h2>
            <p className="mb-6">
              Are you sure you want to{' '}
              {popupType === 'approve' ? 'approve' : 'decline'} this request?
            </p>
            <div className="flex justify-end">
              <button
                onClick={popupType === 'approve' ? handleApprove : handleDecline}
                disabled={isProcessing}
                className={`px-4 py-2 text-white rounded mr-4 ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : popupType === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {popupType === 'approve' ? 'Approve' : 'Decline'}
              </button>
              <button
                onClick={closePopup}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

{selectedRequestItems.length > 0 && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded shadow-lg w-1/2 space-y-4">
      <h2 className="text-xl font-bold">Request ID: {selectedRequestId}</h2>
      <p className="text-lg font-medium">Requester Name: {requesterName || "N/A"}</p>
      <p className="text-lg font-medium">Site Name: {selectedSiteName || "N/A"}</p>

      <div className="overflow-auto max-h-80 ">
        <table className="min-w-full table-auto bg-white border border-gray-300">
          <thead className="bg-gray-100 ">
            <tr>
              <th className="py-2 px-9 border-b text-left">Requested Quantity</th>
              <th className="py-2 px-12 border-b text-left">Request Date</th>
              <th className="py-2 px-9 border-b text-left">Name</th>
              <th className="py-2 px-9 border-b text-left">Description</th>
              <th className="py-2 px-9 border-b text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {selectedRequestItems.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-9 border-b">{item.requestedQuantity}</td>
                <td className="py-2 px-8 border-b">{item.requestDate}</td>
                <td className="py-2 px-9 border-b">{item.materialName}</td>
                <td className="py-2 px-9 border-b">{item.materialDescription}</td>
                <td className="py-2 px-9 border-b">{item.reasonForRequest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={closeDetailsModal}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      
    </div>
    </div>
    
  );
};

export default RequestListPage;
