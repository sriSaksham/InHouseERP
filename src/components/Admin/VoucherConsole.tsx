import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface ExpenseVoucher {
  id: number;
  employeeId: number;
  empName: string;
  amount: number;
  voucherDate: string;
  description: string;
  fileName: string;
  data: string; // Base64 data
  type: string; // MIME type
}

const UnapprovedPaymentsPage: React.FC = () => {
  const [unapprovedPayments, setUnapprovedPayments] = useState<ExpenseVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ExpenseVoucher | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<{ id: number | null; open: boolean }>({
    id: null,
    open: false,
  });
  useEffect(() => {
    const fetchUnapprovedPayments = async () => {
      try {
        const response = await axiosInstance.get("/expense-vouchers/unapproved-payments");
        console.log("API Response:", response.data);
        setUnapprovedPayments(response.data);
      } catch (err) {
        setError("Failed to fetch unapproved payments. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnapprovedPayments();
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id)); 
  };

  const handleOpenFile = (file: ExpenseVoucher) => {
    setSelectedFile(file);
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
  };
  const handleApprovePopup = (id: number) => {
    setShowPopup({ id, open: true });
  };

  const handleApproveConfirm = async () => {
    if (showPopup.id !== null) {
      try {
        const approverId = localStorage.getItem("userId"); 
        const approvedBy = localStorage.getItem("username"); 
  
        const response = await axiosInstance.post(
          `/expense-vouchers/approve/${showPopup.id}`,
          null,
          {
            params: {
              approverId: approverId,
              approvedBy: approvedBy,
            },
          }
        );
  
        if (response.status === 200) {
          alert("Expense voucher approved successfully.");
          setUnapprovedPayments((prev) =>
            prev.filter((payment) => payment.id !== showPopup.id)
          );
        }
      } catch (error) {
        console.error("Error approving voucher:", error);
        alert("Failed to approve the voucher. Please try again.");
      } finally {
        setShowPopup({ id: null, open: false });
      }
    }
  };
  

  const handlePopupCancel = () => {
    setShowPopup({ id: null, open: false });
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 p-6">
      <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
        Unapproved Payments
      </h4>
  
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : unapprovedPayments.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No unapproved payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Voucher ID</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Employee ID</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Employee Name</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Amount (₹)</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Voucher Date</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 w-1/3">Description</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">File</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedPayments.map((payment) => (
                <React.Fragment key={payment.id}>
                  <tr
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => toggleRow(payment.id)} // Toggle row on click
                  >
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{payment.id}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{payment.employeeId}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{payment.empName}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">₹{payment.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                      {new Date(payment.voucherDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200 text-sm">
                        {payment.description.length > 70 ? (
                         <>
                         {expandedRow === payment.id
                           ? payment.description 
                           : `${payment.description.slice(0, 50)}... `}
                          <button
                             className="text-blue-500 underline"
                             onClick={(e) => {
                             e.stopPropagation(); // Prevent row click event
                             toggleRow(payment.id);
                            }}
                            >
                           {expandedRow === payment.id ? "View Less" : "View More"}
                         </button>
                          </>
                       ) : (
                       payment.description // Show full description without "View More"
                       )}
                    </td>
                    <td className="px-4 py-2 text-blue-500 truncate max-w-[150px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleOpenFile(payment);
                        }}
                        className="underline"
                        title={payment.fileName}
                      >
                        {payment.fileName}
                      </button>
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleApprovePopup(payment.id);
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event
                          alert(`Rejected Voucher ID: ${payment.id}`);
                        }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
   {/* Confirmation Popup */}
   {showPopup.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Voucher ID: {showPopup.id}</h3>
            <p className="mb-6">Do you want to approve this voucher?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                onClick={handlePopupCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                onClick={handleApproveConfirm}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: "100px", minHeight: "300px", resize: "both", overflow: "auto" }}
          >
            <button
              className="absolute top-2 right-2 text-black text-xl"
              onClick={handleCloseModal}
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">{selectedFile.fileName}</h2>
            {selectedFile.type.startsWith("image/") ? (
              <img
                src={`data:${selectedFile.type};base64,${selectedFile.data}`}
                alt={selectedFile.fileName}
                className="max-w-[40vw] max-h-[80vh] mx-auto"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <iframe
                src={`data:${selectedFile.type};base64,${selectedFile.data}`}
                title={selectedFile.fileName}
                className="w-full h-[80vh]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
  
};

export default UnapprovedPaymentsPage;
