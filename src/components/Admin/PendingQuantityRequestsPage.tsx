import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";


const PendingQuantityRequestsPage: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; 
  const navigate = useNavigate();


  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get("/inventory/view-quantity-history-pending");
        setPendingRequests(response.data);
      } catch (err) {
        setError("Failed to fetch pending requests.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  

  const handleViewMore = async (requestId: number) => {
    try {
      await axiosInstance.get(`/inventory/view-quantity-history/${requestId}`);

      navigate(`/admin/editrequestapprove?requestId=${requestId}`);
    } catch (err) {
      console.error("Error fetching request details:", err);
      alert("Failed to fetch details; cannot proceed to 'View More'.");
    }
  };

 

  
  const totalPages = Math.ceil(pendingRequests.length / pageSize);
  const paginatedRequests = pendingRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="text-xl font-semibold text-black dark:text-white mb-6">Pending Quantity Requests</h4>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : pendingRequests.length === 0 ? (
        <p className="text-center text-gray-500">No pending requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-strokedark">
            <thead className="bg-gray-200 dark:bg-meta-4">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Request ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Requester Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Scope of Material</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Apply Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Requester Comment</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-100 dark:hover:bg-meta-2">
                  <td className="border border-gray-300 px-4 py-2">{request.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.requesterName}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.scopeOfMaterial}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.status}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.applyDate}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.requesterComment}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleViewMore(request.id)}
                      className="ml-2 px-4 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition duration-200 shadow-default dark:border-strokedark dark:bg-boxdark"
                    >
                      View More
                    </button>    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-1 border border-gray-400 rounded bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-1 border border-gray-400 rounded bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
            
          </div>
      )}
 
;

export default PendingQuantityRequestsPage;
