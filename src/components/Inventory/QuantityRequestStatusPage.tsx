import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface QuantityRequest {
  id: number;
  requesterName?: string;
  scopeOfMaterial?: string;
  status: string;       
  applyDate?: string;
  approverName: string;
  requesterComment?: string;
}

const StatusPage: React.FC = () => {
  const [requests, setRequests] = useState<QuantityRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        let queryParam = "";
        if (filter === "approved") {
          queryParam = "?status=APPROVED";
        } else if (filter === "pending") {
          queryParam = "?status=PENDING";
        }
      
        const response = await axiosInstance.get(`/inventory/view-quantity-history-pending${queryParam}`);

        console.log("Fetched Requests:", response.data);
        setRequests(response.data);
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
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Quantity Request Status
      </h4>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        {/* APPROVED */}
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 rounded ${
            filter === "approved" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Approved
        </button>
        {/* PENDING */}
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded ${
            filter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending
        </button>
      </div>

      {loading && <p>Loading requests...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Table of Requests */}
      {!loading && requests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Request ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Requester Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Scope of Material</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Apply Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Approver Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Requester Comment</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{req.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.requesterName || "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.scopeOfMaterial || "N/A"}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 ${
                      req.status === "APPROVED"
                        ? "text-green-600"
                        : req.status === "PENDING"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {req.status}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{req.applyDate || "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.approverName || "N/A"}</td>

                  <td className="border border-gray-300 px-4 py-2">{req.requesterComment || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data Message */}
      {!loading && requests.length === 0 && (
        <p className="text-gray-500 text-center mt-4">No requests found.</p>
      )}
    </div>
  );
};

export default StatusPage;
