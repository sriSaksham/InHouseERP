import React, { useState, useEffect } from "react";
import { Inventory } from "../../types/invent";
import axiosInstance from "../../utils/axiosInstance";
import { useSite } from "../SiteContext/SiteContext";

interface Vendor {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
  panNumber: string;
}

const initialInventoryData: (Omit<Inventory, "vendorName" | "remark" | "invoiceDate" | "invoiceId" | "gstNumber"> & { nameError: boolean; dateError: boolean; })[] = [
  {
    id: "",
    materialId: 0,
    name: "",
    description: "",
    price: 0,
    availableQuantity: 1,
    total: 0,
    unit: "",
    scopeOfMaterial: "",
    nameError: false,
    dateError: false,
    unitPrice: 0,
    misc: 0,
    gst: 0,
    miscRemark: ""
  },
];

const InventoryPage: React.FC = () => {
  const { siteId } = useSite();
  const [inventoryData, setInventoryData] = useState(initialInventoryData);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<Inventory[]>([]);
  const [searchResults, setSearchResults] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [requesterComment, setRequesterComment] = useState<string>("");

  const [globalVendorName, setGlobalVendorName] = useState<string>("");
  const [globalInvoiceDate, setGlobalInvoiceDate] = useState<string>("");
  const [globalRemark, setGlobalRemark] = useState<string>("");
  const [globalGSTNumber, setGlobalGSTNumber] = useState<string>("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorSearchResults, setVendorSearchResults] = useState<Vendor[]>([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axiosInstance.get("/inventory/materials");
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

     const fetchVendors = async () => {
      try {
        const response = await axiosInstance.get("/vendors/all");
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchMaterials();
    fetchVendors();
  }, []);

  const handleInputChange = (index: number, field: keyof Inventory, value: string | number) => {
    setInventoryData((prevInventory) =>
      prevInventory.map((item, i) =>
        i === index ? { ...item, [field]: value, total: field === "price" ? Number(value) : item.total } : item
      )
    );
  };

  const handleNameChange = (index: number, value: string) => {
    setSearchResults(
      value.trim()
        ? materials.filter((material) => material.name.toLowerCase().includes(value.toLowerCase()))
        : []
    );

    setInventoryData((prevInventory) =>
      prevInventory.map((item, i) =>
        i === index
          ? { ...item, name: value, materialId: 0, description: "", scopeOfMaterial: "" }
          : item
      )
    );
  };

  const handleSelectMaterial = (index: number, material: Inventory) => {
    setInventoryData((prevInventory) =>
      prevInventory.map((item, i) =>
        i === index
          ? {
              ...item,
              materialId: Number(material.id),
              name: material.name,
              description: material.description || "",
              price: material.price,
              scopeOfMaterial: material.scopeOfMaterial,
              nameError: false,
              dateError: false,
            }
          : item
      )
    );
    setSearchResults([]);
    console.log("Selected Material:", material);
  };

  const handleVendorNameChange = (value: string) => {
    setGlobalVendorName(value);
    if (value.trim()) {
      const results = vendors.filter((v) =>
        v.name.toLowerCase().includes(value.toLowerCase())
      );
      setVendorSearchResults(results);
    } else {
      setVendorSearchResults([]);
    }
  };

  const handleSelectVendor = (vendor: Vendor) => {
    setGlobalVendorName(vendor.name);
    setGlobalGSTNumber(vendor.gstNumber || "");
    setVendorSearchResults([]);
  };


  const handleAddRow = () => {
    setInventoryData((prevInventory) => [
      ...prevInventory,
      {
        id: "",
        materialId: 0,
        name: "",
        description: "",
        price: 0,
        availableQuantity: 1,
        total: 0,
        unit: "",
        scopeOfMaterial: "",
        nameError: false,
        dateError: false,
        unitPrice: 0,
        gst: 0,
        misc: 0,
        miscRemark: ""
      },
    ]);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    setInventoryData((prevInventory) =>
      prevInventory.map((item) => {
        const nameError = !item.name.trim();
        if (nameError) isValid = false;
        return { ...item, nameError };
      })
    );

    if (!uploadedFile) {
      setFileError("Please upload a valid file.");
      isValid = false;
    } else {
      setFileError(null);
    }

    return isValid;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setFileError("Only JPEG,PNG and PDF files are allowed.");
        setUploadedFile(null);
        return;
      }
      setUploadedFile(file);
      setFileError(null);
    }
  };

  const handleSubmit = async () => {
    if (loading) return; 

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (uploadedFile) formData.append("file", uploadedFile);

      const extractedScopeOfMaterial = inventoryData.length > 0
        ? inventoryData[0].scopeOfMaterial || "N/A"
        : "N/A";

      const grandTotal = inventoryData.reduce((acc, item) => {
        const baseAmount = item.unitPrice * item.availableQuantity + item.misc;
        const rowTotal = baseAmount * (1 + item.gst / 100);
        return acc + rowTotal;
      }, 0);

      const jsonData = {
        siteId,
        requesterId: Number(localStorage.getItem("userId")),
        vendorName: globalVendorName,
        vendorId: 0, 
        billDate: globalInvoiceDate || null,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        remark: globalRemark,
        scopeOfMaterial: extractedScopeOfMaterial,
        requesterComment,
        materials: inventoryData.map(({ nameError, dateError, ...item }) => {
          const rowBaseAmount = item.unitPrice * item.availableQuantity + item.misc;
          const rowTotal = rowBaseAmount * (1 + item.gst / 100);

          return {
            materialId: item.materialId,
            quantity: item.availableQuantity,
            GSTNumber: globalGSTNumber,
            materialDescription: item.description,
            unitPrice: item.unitPrice,
            miscCharges: item.misc,
            tax: item.gst,
            totalAmount: parseFloat(rowTotal.toFixed(2)),
            remark: item.miscRemark,
          };
        }),
      };

      if (!jsonData.materials.length) {
        alert("Inventory data cannot be empty.");
        setLoading(false);
        return;
      }

      formData.append(
        "quantityDTOs",
        new Blob([JSON.stringify(jsonData)], { type: "application/json" })
      );

      console.log("JSON Data to Backend:", jsonData);

      const response = await axiosInstance.post("inventory/request-add-quantities", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        alert("Request Raised successfully!");
      } else {
        console.error("Error Response:", response);
        alert("Failed to submit data. Please try again.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRow = (index: number) => {
    setInventoryData((prevInventory) => prevInventory.filter((_, i) => i !== index));
  };

  const grandTotal = inventoryData.reduce((acc, item) => {
    const baseAmount = item.unitPrice * item.availableQuantity ;
    const rowTotal = baseAmount * (1 + item.gst / 100)+ item.misc;
    return acc + rowTotal;
  }, 0);

  return (
    <div className="max-w-[2000px] w-full mx-auto rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Inventory Add Quantity
      </h4>

      <div className="mb-6 p-4 rounded border border-gray-300 dark:border-strokedark">
        <h5 className="mb-4 text-lg font-medium">Global Vendor Details</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Vendor Name</label>
            <input
              type="text"
              placeholder="Vendor Name"
              value={globalVendorName}
              onChange={(e) => handleVendorNameChange(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
            {/* Vendor Search Results */}
            {vendorSearchResults.length > 0 && (
              <ul className="absolute z-50 bg-white border border-gray-300 rounded shadow-md w-full mt-1 max-w-sm">
  {vendorSearchResults.map((vendor, i) => (
                  <li
                    key={i}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSelectVendor(vendor)}
                  >
                    {vendor.name}
                  </li>
                ))}
              </ul>
            )}
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

          {/* GST Number - auto-filled after vendor is selected */}
          <div>
            <label className="block mb-1">GST Number</label>
            <input
              type="text"
              placeholder="GST Number"
              value={globalGSTNumber}
              onChange={(e) => setGlobalGSTNumber(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">Global Remark</label>
            <input
              type="text"
              placeholder="Global Remark"
              value={globalRemark}
              onChange={(e) => setGlobalRemark(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block mb-1">Attach Bill</label>
            <input
              type="file"
              onChange={handleFileUpload}
              className={`max-w-xs cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-1 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary ${
                fileError ? "border-red-500" : ""
              }`}
            />
            {fileError && (
              <p className="text-red-500 text-sm mt-2">
                Please upload a valid JPEG, PNG or PDF file.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[2000px] grid grid-cols-[2.3fr_2fr_1.5fr_1.7fr_1.3fr_1.5fr_1.3fr_1.5fr_1.5fr_1.5fr_1fr] rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Name</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Description</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Material ID</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Scope</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Quantity</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Unit Price</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Misc</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Misc Remark</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">gst(%)</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Total</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
          </div>
        </div>

        {inventoryData.map((item, index) => {
          const baseAmount = item.unitPrice * item.availableQuantity + item.misc;
          const rowTotal = baseAmount * (1 + item.gst / 100);
          return (
            <div
              key={index}
              className={`min-w-[2000px] grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr_1.5fr_1.5fr_1fr] ${
                index === inventoryData.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              }`}
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={item.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className={`w-full rounded border px-2 py-1 ${
                      item.nameError
                        ? "border-red-500"
                        : "border-gray-300 dark:border-strokedark"
                    }`}
                  />
                  {index === inventoryData.length - 1 && searchResults.length > 0 && (
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
              </div>

              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <input
                  type="text"
                  value={item.description}
                  readOnly
                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <input
                  type="number"
                  value={item.materialId || ""}
                  readOnly
                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center ">
                <input
                  type="text"
                  placeholder="Category of Material"
                  value={item.scopeOfMaterial}
                  readOnly
                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-center gap-3 p-2.5 xl:p-5">
                <input
                  type="number"
                  placeholder="0"
                  value={item.availableQuantity}
                  onChange={(e) =>
                    handleInputChange(index, "availableQuantity", parseInt(e.target.value) || 0)
                  }
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-center dark:border-strokedark"
                />
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleInputChange(index, "unitPrice", parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <input
                  type="number"
                  placeholder="Misc"
                  value={item.misc}
                  onChange={(e) => handleInputChange(index, "misc", parseFloat(e.target.value) || 0)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <input
                  type="text"
                  placeholder="Misc Remark"
                  value={item.miscRemark}
                  onChange={(e) => handleInputChange(index, "miscRemark", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <input
                  type="number"
                  placeholder="gst"
                  value={item.gst}
                  onChange={(e) =>
                    handleInputChange(index, "gst", parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <input
                  type="number"
                  value={rowTotal.toFixed(2)}
                  readOnly
                  className="w-full rounded border px-2 py-1 bg-gray-200 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <button
                  onClick={() => handleRemoveRow(index)}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleAddRow}
            className="w-8 h-8 text-xl font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="text-lg font-bold">
          Grand Total: ₹{grandTotal.toFixed(2)}
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Requester Comment</h3>
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Enter a comment for this request..."
        value={requesterComment}
        onChange={(e) => setRequesterComment(e.target.value)}
      />

      <div className="flex justify-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-md bg-primary py-2 px-10 text-center font-medium text-white ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-90"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default InventoryPage;
