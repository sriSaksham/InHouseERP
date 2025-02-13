import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { RequestItem } from '../../types/request';

const ApprovedRequestsPage: React.FC = () => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any | null>(null);
  const [, setSelectedRequestItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState(false);

  // Fetch Approved Requests
  useEffect(() => {
    const fetchApprovedRequests = async () => {
      try {
        const response = await axiosInstance.get('/inventory/master-requests?status=APPROVED');
        setApprovedRequests(response.data);
      } catch (err) {
        console.error('Error fetching approved requests:', err);
        setError('Failed to load approved requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRequests();
  }, []);

  // Fetch Request Details
  const fetchRequestDetails = async (requestId: string) => {
    try {
      setViewingRequest(true);
      const response = await axiosInstance.get(`/inventory/master-requests/${requestId}`, {
        params: { approved: true }, // Explicitly fetch approved requests
      });
      console.log('Approved Request Details Response:', response.data);
      const siteName = response.data.siteName || 'N/A';

      const items = response.data.materialRequestDTOList.map((item: any) => ({
        id: item.materialId.toString(),
        materialId: item.materialId,
        requestedQuantity: item.requestedQuantity,
        requestDate: item.requestDate,
        siteName: siteName,
        materialName: item.materialName,
        materialDescription: item.materialDescription,
        reasonForRequest: item.reasonForRequest || 'N/A',
        requesterName: response.data.requesterName || 'N/A',
        approverName: response.data.approverName || 'N/A',

      }));

      const requesterId =
        response.data.materialRequestDTOList.length > 0
          ? response.data.materialRequestDTOList[0]?.requesterUserId?.toString() || 'N/A'
          : 'N/A';

      setSelectedRequestItems(items);
      setSelectedRequestDetails({
        requestId: response.data.masterReqId || 'N/A',
        requesterUserId: requesterId,
        approverUserId: response.data.approverUserId || 'N/A',
        materialRequestDTOList: items,
      });

      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching request details:', err);
      alert('Failed to load request details. Please try again.');
    } finally {
      setViewingRequest(false);
    }
  };

  // Close Details Modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequestDetails(null);
    setSelectedRequestItems([]);
  };

  if (loading) {
    return <div>Loading approved requests...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Admin
      </h4>
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Approved Requests</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border border-gray-300 shadow-default dark:border-strokedark dark:bg-boxdark">
          <thead className="bg-gray-100 shadow-default dark:border-strokedark dark:bg-boxdark">
            <tr>
              <th className="py-2 px-4 border-b text-left">Request ID</th>
              <th className="py-2 px-4 border-b text-left">Approval Status</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvedRequests.map((req: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{req.id}</td>
                <td className="py-2 px-4 border-b text-green-600">Approved</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => fetchRequestDetails(req.id)}
                    className="px-4 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition duration-200 shadow-default dark:border-strokedark dark:bg-boxdark"
                    disabled={viewingRequest}
                  >
                    {viewingRequest && selectedRequestDetails?.requestId === req.id
                      ? 'Loading...'
                      : 'Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Request Details (ID: {selectedRequestDetails.requestId || 'N/A'})
              </h2>
              <p className="text-sm font-medium text-gray-600">
                Requester ID: {selectedRequestDetails.requesterUserId || 'N/A'}
              </p>
              <p className="text-sm font-medium text-gray-600">
              Requester Name: {selectedRequestDetails.materialRequestDTOList[0]?.requesterName || 'N/A'}
              </p>
              <p className="text-sm font-medium text-gray-600">
          Approver ID: {selectedRequestDetails.approverUserId || 'N/A'} {/* New */}
        </p>
              <p className="text-sm font-medium text-gray-600">
              Approver Name: {selectedRequestDetails.materialRequestDTOList[0]?.approverName || 'N/A'}
              </p>
             
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-800"
              >
                ✖
              </button>
            </div>

            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full table-auto border border-gray-300 ">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="py-2 px-4 text-left text-gray-600 font-medium">Material ID</th>
                    <th className="py-2 px-4 text-left text-gray-600 font-medium">Quantity</th>
                    <th className="py-2 px-4 text-left text-gray-600 font-medium">Site</th>
                    <th className="py-2 px-4 text-left text-gray-600 font-medium">Name</th>
                  <th className="py-2 px-4 text-left text-gray-600 font-medium">Description</th>
                  <th className="py-2 px-4 text-left text-gray-600 font-medium">Reason</th>

                  </tr>
                </thead>
                <tbody>
                  {selectedRequestDetails.materialRequestDTOList.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4">{item.materialId || 'N/A'}</td>
                      <td className="py-2 px-4">{item.requestedQuantity || 'N/A'}</td>
                      <td className="py-2 px-4">{item.siteName|| 'N/A'}</td>
                      <td className="py-2 px-4">{item.materialName}</td>
                      <td className="py-2 px-4">{item.materialDescription}</td>
                      <td className="py-2 px-4">{item.reasonForRequest || 'N/A'}</td>

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

export default ApprovedRequestsPage;
