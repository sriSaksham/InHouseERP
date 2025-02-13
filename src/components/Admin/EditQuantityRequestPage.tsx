import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Inventory } from "../../types/invent";

interface PurchaseSummaryViewDTO {
  id?: number;
  siteId?: number;
  billId?: number;
  billDate?: string; 
  vendorName?: string;
  vendorId?: number;
  remark?: string;   
  grandTotal?: number;
  scopeOfMaterial?: string;
  requesterId?: number;
  requesterName?: string;
  requesterComment?: string;
  approverId?: number;
  approverName?: string;
  approverComment?: string;
  materials: PSMaterialViewDTO[];
}

interface PSMaterialViewDTO {
  reqId?: number;          
  materialId?: number;
  quantity?: number;
  materialDescription?: string;
  unitPrice?: number;
  miscCharges?: number;
  tax?: number;
  totalAmount?: number;
  remark?: string;           
  unit?: string;
}

type EditableRow = Omit<
  Inventory,
  "vendorName" | "invoiceDate" | "gstNumber" | "remark" | "invoiceId" | "gst"
> & {
  nameError: boolean;
  dateError: boolean;
  miscRemark: string;
  tax: number;
};

const EditQuantityRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [globalVendorName, setGlobalVendorName] = useState<string>("");
  const [globalInvoiceDate, setGlobalInvoiceDate] = useState<string>(""); 
  const [globalGSTNumber, setGlobalGSTNumber] = useState<string>(""); 
  const [globalRemark, setGlobalRemark] = useState<string>("");
  const [approverComment, setApproverComment] = useState<string>("");
  const [itemRows, setItemRows] = useState<EditableRow[]>([]);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<PurchaseSummaryViewDTO | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  console.log(selectedRequestId);

  useEffect(() => {
    if (!requestId) {
      setError("No request ID provided.");
      setLoading(false);
      return;
    }

    const fetchRequestDetails = async () => {
      try {
        const response = await axiosInstance.get(`/inventory/view-quantity-history/${requestId}`);
        const data: PurchaseSummaryViewDTO = response.data;
        console.log(data);
        console.log(response);

        setSelectedRequestDetails(data);
        setSelectedRequestId(requestId ? parseInt(requestId) : null);

        setGlobalVendorName(data.vendorName || "");
        setGlobalInvoiceDate(data.billDate || "");
        setGlobalGSTNumber(""); 
        setGlobalRemark(data.remark || "");

        const rows = (data.materials || []).map((m) => {
          const base = m.unitPrice || 0;
          const qty = m.quantity || 0;
          const misc = m.miscCharges || 0;
          const tax = m.tax || 0;

          return {
            id: (m.reqId || 0).toString(),   
            materialId: m.materialId || 0,
            name: "",                         
            description: m.materialDescription || "",
            price: 0,                       
            availableQuantity: qty,
            total: m.totalAmount || 0,
            unit: m.unit || "",
            scopeOfMaterial: data.scopeOfMaterial || "",
            unitPrice: base,
            tax: tax,
            misc: misc,
            miscRemark: m.remark || "",
            nameError: false,
            dateError: false,
          };
        });

        setItemRows(rows);
      } catch (err) {
        setError("Failed to load request details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const handleNameChange = (index: number, value: string) => {
    setItemRows((prevRows) =>
      prevRows.map((item, i) => (i === index ? { ...item, name: value } : item))
    );
  };

  const handleItemInputChange = (
    index: number,
    field: keyof EditableRow,
    value: string | number
  ) => {
    setItemRows((prevRows) =>
      prevRows.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const calculateRowTotal = (item: EditableRow) => {
    const baseAmount = item.unitPrice * item.availableQuantity + item.misc;
    return baseAmount * (1 + item.tax / 100);
  };

  const grandTotal = itemRows.reduce((acc, item) => acc + calculateRowTotal(item), 0);

 const handleApprove = async (id?: number) => {
  if (!id) {
    alert("No request id available for approval.");
    return;
  }
  try {
    const updatedMaterials = itemRows.map((row) => ({
      reqId: parseInt(row.id),            // from row.id
      materialId: row.materialId,
      quantity: row.availableQuantity,
      materialDescription: row.description,
      unitPrice: row.unitPrice,
      miscCharges: row.misc,
      tax: row.tax,
      totalAmount: calculateRowTotal(row),
      remark: row.miscRemark,
      unit: row.unit,
    }));

    const userId = parseInt(localStorage.getItem("userId") || "0");

        const updatedDTO: PurchaseSummaryViewDTO = {
      ...selectedRequestDetails,
      vendorName: globalVendorName,
      billDate: globalInvoiceDate,
      remark: globalRemark,
      approverId: userId,
      approverComment,
      grandTotal,
      materials: updatedMaterials,
    };
    console.log('userId', userId);


    const response = await axiosInstance.post(
      `/inventory/approve-reject-purchase-summary/${id}?status=APPROVED`,
      updatedDTO
    );
      console.log(response);
    alert("Request Approved Successfully");
    navigate("/admin/quantity/requests");
  } catch (error) {
    console.error("Error approving request:", error);
    alert("Error approving request");
  }
};

const handleDecline = async (id?: number) => {
  if (!id) {
    alert("No request id available for approval.");
    return;
  }
  try {
    const updatedMaterials = itemRows.map((row) => ({
      reqId: parseInt(row.id),
      materialId: row.materialId,
      quantity: row.availableQuantity,
      materialDescription: row.description,
      unitPrice: row.unitPrice,
      miscCharges: row.misc,
      tax: row.tax,
      totalAmount: calculateRowTotal(row),
      remark: row.miscRemark,
      unit: row.unit,
    }));

    const userId = parseInt(localStorage.getItem("userId") || "0");
    const userName = localStorage.getItem("userName") || "";
    console.log(userName);
    console.log(userId);
        const updatedDTO: PurchaseSummaryViewDTO = {
      ...selectedRequestDetails,
      vendorName: globalVendorName,
      billDate: globalInvoiceDate,
      remark: globalRemark,
      approverId: userId,
      approverComment,
      grandTotal,
      materials: updatedMaterials,
    };

    const response = await axiosInstance.post(
      `/inventory/approve-reject-purchase-summary/${id}?status=REJECTED`,
      updatedDTO
    );
    console.log('declined', response.data);

    alert("Request Rejected Successfully");
    navigate("/admin/quantity/requests");
  } catch (error) {
    console.error("Error declining request:", error);
    alert("Error declining request");
  }
};

  const handleViewBill = async () => {
    if (!selectedRequestDetails?.billId) {
      alert("No bill ID found for this request.");
      return;
    }
  
    try {
      const response = await axiosInstance.get(
        `/files/${selectedRequestDetails.billId}/view`, 
        {
          responseType: "blob",
        }
      );
  
      const file = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const fileURL = URL.createObjectURL(file);
  
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error fetching bill:", error);
      alert("Failed to load bill. File may not exist.");
    }
  };
  

  if (loading) {
    return <p className="text-center text-gray-500">Loading request details...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-[2000px] w-full mx-auto rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black">
        Edit Request - ID: {requestId}
      </h4>

      <div className="mb-6 p-4 rounded border border-gray-300 dark:border-strokedark">
        <h5 className="mb-4 text-lg font-medium">Global Vendor Details</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Vendor Name</label>
            <input
              type="text"
              value={globalVendorName}
              onChange={(e) => setGlobalVendorName(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">Invoice Date</label>
            <input
              type="date"
              value={globalInvoiceDate}
              onChange={(e) => setGlobalInvoiceDate(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">GST Number</label>
            <input
              type="text"
              value={globalGSTNumber}
              onChange={(e) => setGlobalGSTNumber(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">Global Remark</label>
            <input
              type="text"
              value={globalRemark}
              onChange={(e) => setGlobalRemark(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
        </div>
      </div>

        <div className="mb-6 p-4 rounded border border-gray-300 dark:border-strokedark">
        <h5 className="mb-4 text-lg font-medium">Request Details</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Bill ID</label>
            <input
              type="text"
              readOnly
              value={selectedRequestDetails?.billId ?? ""}
              className="w-full rounded border px-2 py-1 bg-gray-200"
            />
          </div>
          <div>
            <label className="block mb-1">Requester Name</label>
            <input
              type="text"
              readOnly
              value={selectedRequestDetails?.requesterName ?? ""}
              className="w-full rounded border px-2 py-1 bg-gray-200"
            />
          </div>
          <div>
            <label className="block mb-1">Requester Comment</label>
            <textarea
              readOnly
              value={selectedRequestDetails?.requesterComment ?? ""}
              className="w-full rounded border px-2 py-1 bg-gray-200 h-9"
            />
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[2000px] grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Name</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Description</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Material ID</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Quantity</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Scope</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Tax (%)</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Unit Price</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Misc</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Misc Remark</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase">Total</h5>
          </div>
        </div>

        {itemRows.map((item, index) => {
          const rowTotal = calculateRowTotal(item);

          return (
            <div
              key={index}
              className={`min-w-[2000px] grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] ${
                index === itemRows.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              }`}
            >
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={item.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemInputChange(index, "description", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="number"
                  value={item.materialId || ""}
                  onChange={(e) =>
                    handleItemInputChange(index, "materialId", parseInt(e.target.value) || 0)
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <input
                  type="number"
                  value={item.availableQuantity}
                  onChange={(e) =>
                    handleItemInputChange(index, "availableQuantity", parseInt(e.target.value) || 0)
                  }
                  className="w-16 rounded border px-2 py-1 text-center"
                />
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="text"
                  value={item.scopeOfMaterial}
                  onChange={(e) => handleItemInputChange(index, "scopeOfMaterial", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="number"
                  value={item.tax}
                  onChange={(e) => handleItemInputChange(index, "tax", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemInputChange(index, "unitPrice", parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="number"
                  value={item.misc}
                  onChange={(e) => handleItemInputChange(index, "misc", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <input
                  type="text"
                  value={item.miscRemark}
                  onChange={(e) => handleItemInputChange(index, "miscRemark", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <input
                  type="number"
                  value={rowTotal.toFixed(2)}
                  readOnly
                  className="w-full rounded border px-2 py-1 bg-gray-200"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <div className="text-lg font-bold">
          Grand Total: ₹{grandTotal.toFixed(2)}
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Approver Comment</h3>
      <textarea
        className="w-full border p-2 rounded"
        value={approverComment}
        onChange={(e) => setApproverComment(e.target.value)}
        placeholder="Enter a comment for this request..."
      />

      <div className="flex justify-center mt-6">
        <button
          onClick={handleViewBill}
          className="px-6 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition duration-200 shadow-default"
        >
          View Bill
        </button>
      </div>

      <div className="flex justify-center mt-6 space-x-4">
        <button
        onClick={() => handleApprove(selectedRequestId ?? undefined)}
        className="px-6 py-2 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition duration-200 shadow-default"
        >
          Approve
        </button>
        <button
          onClick={() => handleDecline(selectedRequestId ?? undefined)}
          className="px-6 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition duration-200 shadow-default"
                  >
          Decline
        </button>
      </div>
    </div>
  );
};

export default EditQuantityRequestPage;
