import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inventory } from "../../types/inventory";
import axiosInstance from "../../utils/axiosInstance";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSite } from "../SiteContext/SiteContext";

const generateRequestNumber = () => {
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const randomNumbers = Math.floor(1000 + Math.random() * 9000);
  return `${yyyymmdd}${randomNumbers}`;
};

interface RequestRow extends Inventory {
  nameError: boolean;
  requestedQuantity: number;   
  unitPrice: number;          
  tax: number;                
  misc: number;              
  itemRemark: string;        
  total: number;      
  billIssueNumber: string;        
}
const initialRow: RequestRow = {
  id: "",
  materialId: 0,
  name: "",
  description: "",
  unit: "",
  scopeOfMaterial: "",
  price: 0,
  availableQuantity: 0,
  total: 0,

  nameError: false,
  requestedQuantity: 1, 
  unitPrice: 0,
  tax: 0,
  misc: 0,
  itemRemark: "",
  billIssueNumber: "",       

};

const RequestItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const { siteId } = useSite();

  const [materials, setMaterials] = useState<Inventory[]>([]);
  const [requestData, setRequestData] = useState<RequestRow[]>([initialRow]);
  const [searchResults, setSearchResults] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestNumber, setRequestNumber] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reasonForRequest, setReasonForRequest] = useState<string>("");
  const [billIssueNumber, setBillIssueNumber] = useState<string>("");

  const [availableQuantities, setAvailableQuantities] = useState<{
    [materialId: number]: number;
  }>({});

  useEffect(() => {
    const fetchMaterialQuantities = async () => {
      if (!siteId) return;
      try {
        const response = await axiosInstance.get(
          `/inventory/materials/quantities/${siteId}`
        );
        const qtyMap: { [materialId: number]: number } = {};
        response.data.forEach((item: any) => {
          qtyMap[item.materialId] = item.availableQuantity || 0;
        });
        setAvailableQuantities(qtyMap);
      } catch (err) {
        console.error("Error fetching available quantities:", err);
      }
    };
    fetchMaterialQuantities();
  }, [siteId]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axiosInstance.get("/inventory/materials");
        setMaterials(response.data);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Failed to load inventory data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleNameChange = (index: number, value: string) => {
    setSearchResults(
      value.trim()
        ? materials.filter((material) =>
            material.name.toLowerCase().includes(value.toLowerCase())
          )
        : []
    );

    setRequestData((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              name: value,
              materialId: 0,
              description: "",
              scopeOfMaterial: "",
              nameError: false,
              price: 0,
              availableQuantity: 0,
              unitPrice: 0,
              tax: 0,
              misc: 0,
              itemRemark: "",
              total: 0,
            }
          : row
      )
    );
  };

  const handleSelectMaterial = (index: number, material: Inventory) => {
    setRequestData((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              materialId: Number(material.id),
              name: material.name,
              description: material.description || "",
              unit: material.unit || "",
              scopeOfMaterial: material.scopeOfMaterial,
              nameError: false,
              price: material.price,
              availableQuantity: material.availableQuantity,
            }
          : row
      )
    );
    setSearchResults([]);
  };

  const handleRowInputChange = (
    index: number,
    field: keyof RequestRow,
    value: string | number
  ) => {
    setRequestData((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === "requestedQuantity") {
          const newQty = parseInt(value as string) || 0;
          const materialId = row.materialId ?? 0; 
          const maxAvailable = availableQuantities[materialId] ?? Infinity;

          if (newQty > maxAvailable) {
            alert(
              `You cannot request more than ${maxAvailable} units for this material!`
            );
            return { ...row, requestedQuantity: maxAvailable };
          }
          return { ...row, requestedQuantity: newQty };
        } else {
          return { ...row, [field]: value };
        }
      })
    );
  };
  const handleAddRow = () => {
    setRequestData((prev) => [...prev, { ...initialRow }]);
  };

  const handleRemoveRow = (index: number) => {
    setRequestData((prev) => prev.filter((_, i) => i !== index));
  };

  const computeRowTotal = (row: RequestRow) => {
    const base = row.unitPrice * row.requestedQuantity ;
    return base * (1 + row.tax / 100)+ row.misc;
  };

  const grandTotal = requestData.reduce(
    (acc, row) => acc + computeRowTotal(row),
    0
  );

  const handleRequestSubmit = async () => {
    if (!siteId) {
      alert("Please select a site before submitting the request.");
      return;
    }

    const validRows = requestData.filter((r) => r.name.trim() !== "");
    if (validRows.length === 0) {
      alert("Please add at least one requested item.");
      return;
    }

    const generatedRequestNumber = generateRequestNumber();
    setRequestNumber(generatedRequestNumber);

    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "";
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    const payload = validRows.map((row) => {
      const total = computeRowTotal(row);
      return {
        materialId: row.materialId,
        materialName: row.name || "N/A",
        materialDescription: row.description || "N/A",
        requestedQuantity: row.requestedQuantity,
        requestDate: new Date().toISOString().split("T")[0],
        siteId: Number(siteId),
        requesterUserId: Number(userId),
        requesterUserName: userName,
        approverUserId: 0, 
        approverUserName: "",
        reasonForRequest: reasonForRequest || "", 
        billIssueNumber: billIssueNumber,
        unitPrice: row.unitPrice,
        miscCharges: row.misc,
        tax: row.tax,
        totalAmount: total, 
        itemRemark: row.itemRemark,
        unit: row.unit || "",
      };
    });

    try {
      await axiosInstance.post(`/inventory/request-material`, payload, {
        params: { masReqId: generatedRequestNumber },
      });
      console.log('Payload send to backend',payload);

      setIsModalOpen(true);
      alert(`Request Number: ${generatedRequestNumber} created successfully!`);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit the request. Please try again.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // navigate("/inventory/summary");
  };

  const generatePDF = () => {
    const validRows = requestData.filter((r) => r.name.trim() !== "");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Request Summary", 14, 20);
    doc.setFontSize(12);
    doc.text(`Request Number: ${requestNumber}`, 14, 30);
    doc.text(`Bill Number: ${billIssueNumber}`, 14, 35);

    const tableColumnHeaders = [
      "S. No.",
      "Name",
      "Description",
      "Quantity",
      "Unit Price",
      "Tax (%)",
      "Misc",
      "Total",
      "Reason",
    ];

    const tableRows = validRows.map((row, index) => [
      index + 1,
      row.name || "N/A",
      row.description || "N/A",
      row.requestedQuantity,
      row.unitPrice,
      row.tax,
      row.misc,
      computeRowTotal(row).toFixed(2),
      reasonForRequest || "N/A",
    ]);

    doc.autoTable({
      startY: 40,
      head: [tableColumnHeaders],
      body: tableRows,
    });

    doc.save(`Request_${requestNumber}.pdf`);
  };

  if (loading) {
    return <div>Loading inventory data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-[2000px] w-full mx-auto rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Request Items
      </h4>

      <div className="flex flex-col relative mb-8">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr] bg-gray-200 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5 font-medium uppercase">Name</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Description</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Mat. ID</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Unit</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Qty</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Unit Price</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Tax (%)</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Misc</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Item Remark</div>
          <div className="p-2.5 xl:p-5 font-medium uppercase">Total</div>
        </div>

        {requestData.map((row, index) => {
          const rowTotal = computeRowTotal(row);
          return (
            <div
              key={index}
              className={`grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr] ${
                index === requestData.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              }`}
            >
              <div className="relative p-2.5 xl:p-5">
                <input
                  type="text"
                  placeholder="Material name"
                  value={row.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className={`w-full rounded border px-2 py-1 ${
                    row.nameError ? "border-red-500" : "border-gray-300 dark:border-strokedark"
                  }`}
                />
                {index === requestData.length - 1 && searchResults.length > 0 && (
                  <ul className="absolute z-50 bg-white border border-gray-300 rounded shadow-md w-full mt-1">
                    {searchResults.map((material, i) => (
                      <li
                        key={i}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleSelectMaterial(index, material)}
                      >
                        {material.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-2.5 xl:p-5">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleRowInputChange(index, "description", e.target.value)
                  }
                  readOnly

                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"                />
              </div>

              <div className="p-2.5 xl:p-5">
                <input
                  type="number"
                  value={row.materialId || ""}
                  readOnly
                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"
                />
              </div>

              <div className="p-2.5 xl:p-5">
                <input
                  type="text"
                  value={row.unit}
                  onChange={(e) => handleRowInputChange(index, "unit", e.target.value)}
                  readOnly

                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"                />
              </div>

              <div className="p-2.5 xl:p-5">
                <input
                  type="number"
                  value={row.requestedQuantity}
                  onChange={(e) =>
                    handleRowInputChange(
                      index,
                      "requestedQuantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              
              <div className="p-2.5 xl:p-5">
                <input
                  type="number"
                  value={row.unitPrice}
                  onChange={(e) =>
                    handleRowInputChange(index, "unitPrice", parseFloat(e.target.value) || 0)
                  }
                  
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="p-2.5 xl:p-5">
                <input
                  type="number"
                  value={row.tax}
                  onChange={(e) =>
                    handleRowInputChange(index, "tax", parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="p-2.5 xl:p-5">
                <input
                  type="number"
                  value={row.misc}
                  onChange={(e) =>
                    handleRowInputChange(index, "misc", parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="p-2.5 xl:p-5">
                <input
                  type="text"
                  value={row.itemRemark}
                  onChange={(e) => handleRowInputChange(index, "itemRemark", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="flex items-center p-2.5 xl:p-5 bg-gray-100">
                <input
                  type="number"
                  value={rowTotal.toFixed(2)}
                  readOnly
                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"
                />
              </div>
            </div>
          );
        })}
        <div className="mt-2">
          <button
            onClick={handleAddRow}
            className="mt-2 ml-2 w-8 h-8 text-xl font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600"
          >
            +
          </button>
          <button
            onClick={() => handleRemoveRow(requestData.length - 1)}
            disabled={requestData.length <= 1}
            className="mt-2 ml-2 w-8 h-8 text-xl font-bold text-white bg-red-500 rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            -
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-8">Bill Issue Number</h3>
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Enter the bill issue number..."
        value={billIssueNumber}
        onChange={(e) => setBillIssueNumber(e.target.value)}
      />

      <h3 className="text-lg font-semibold mt-6">Requester Comment / Reason</h3>
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Enter a comment for this request..."
        value={reasonForRequest}
        onChange={(e) => setReasonForRequest(e.target.value)}
      />

      <div className="mt-4 flex justify-end">
        <div className="text-lg font-bold">Grand Total: ₹{grandTotal.toFixed(2)}</div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={handleRequestSubmit}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit Request
        </button>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/inventory/summary")}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Summary
        </button>
      </div>

      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    {/* Modal Container */}
    <div className="bg-white p-6 rounded shadow-lg w-1/2 max-h-[80vh] overflow-auto">
      <h2 className="text-xl font-bold mb-4">Request Submitted</h2>
      <p className="mb-4">
        Request Number: <strong>{requestNumber}</strong>
      </p>
      <p className="mb-6">
        Bill Number: <strong>{billIssueNumber}</strong>
      </p>

      {/* 1) Scrollable wrapper around the table with max-h, etc. */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white border border-gray-300 table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left w-20">S. No.</th>
              <th className="py-2 px-4 border-b text-left w-32">Name</th>
              <th className="py-2 px-4 border-b text-left w-32">Description</th>
              <th className="py-2 px-4 border-b text-left w-16">Qty</th>
              <th className="py-2 px-4 border-b text-left w-20">Unit Price</th>
              <th className="py-2 px-4 border-b text-left w-16">Tax(%)</th>
              <th className="py-2 px-4 border-b text-left w-16">Misc</th>
              <th className="py-2 px-4 border-b text-left w-20">Total</th>
              {/* 2) Reason column with fixed width */}
              <th className="py-2 px-4 border-b text-left w-48">Reason</th>
            </tr>
          </thead>
          <tbody>
            {requestData.map((row, index) => {
              const rowTotal = computeRowTotal(row).toFixed(2);
              return (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{row.name}</td>
                  <td className="py-2 px-4 border-b">{row.description || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{row.requestedQuantity}</td>
                  <td className="py-2 px-4 border-b">{row.unitPrice}</td>
                  <td className="py-2 px-4 border-b">{row.tax}</td>
                  <td className="py-2 px-4 border-b">{row.misc}</td>
                  <td className="py-2 px-4 border-b">{rowTotal}</td>
                  <td className="py-2 px-4 border-b align-top">
                    {/* Make reason text wrap or scroll if very long */}
                    <div className="max-h-24 overflow-y-auto whitespace-pre-wrap break-words">
                      {reasonForRequest || "No specific reason"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={generatePDF}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download PDF
        </button>
        <button
          onClick={closeModal}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-4"
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

export default RequestItemsPage;
