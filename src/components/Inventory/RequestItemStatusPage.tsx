import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

type Status = {
  id: number;
  materialId: number;
  requestedQuantity: number;
  requestDate: string;
  siteId: number;
  requesterUserId: number;
  approverUserId: number | null;
  approved: boolean;
  materialName?: string;
  siteName?: string;
  requesterUserName?: string;
  approverUserName?: string;
  reasonForRequest?: string;
};


const StatusPage: React.FC = () => {
  const [requests, setRequests] = useState<Status[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"approved" | "pending" | "all">("all");



  useEffect(() => {
    const fetchRequests = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setError("User ID not found in local storage.");
            setLoading(false);
            return;
          }
      setLoading(true);
      setError(null);

      try {
        const queryParam =
          filter === "approved"
            ? "?approved=true"
            : filter === "pending"
            ? "?approved=false"
            : "";

        const response = await axiosInstance.get(
          `/inventory/employee-requests/${userId}${queryParam}`
        );
        console.log("Fetched Requests:", response.data);

        setRequests(response.data);
        console.log("Fetched Requests:", response.data);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to fetch requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 sm:px-7 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Inventory
      </h4>
      <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-lg sm:text-2xl font-bold mb-4 text-center sm:text-left">
      Employee Requests</h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4 mb-6">
      <button
          onClick={() => setFilter("all")}
          className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All Requests
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
            filter === "approved" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Approved Requests
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
            filter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending Requests
        </button>
      </div>

      {/* Loading & Error */}
      {loading && <p>Loading requests...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Request Table */}
      {!loading && requests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">Quantity</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Request Date
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">Site Name</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Material Name
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Requester Name
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Approver Name
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">Reason</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {req.requestedQuantity}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {req.siteName}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {req.materialName}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {req.requesterUserName}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {req.approverUserName}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {req.reasonForRequest}
                    </td>
                    <td
                      className={`border border-gray-300 px-2 sm:px-4 py-2 ${
                        req.approved ? "text-green-500" : "text-yellow-500"
                      }`}
                    >
                      {req.approved ? "Approved" : "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Data Message */}
        {!loading && requests.length === 0 && (
          <p className="text-gray-500 text-center">No requests found.</p>
        )}
      </div>
    </div>
  );
};

export default StatusPage;