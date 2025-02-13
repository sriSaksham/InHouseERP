import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inventory} from "../../types/inventorys";
import axiosInstance from "../../utils/axiosInstance"; 


const initialInventoryData: (Inventory & { nameError: boolean; dateError: boolean })[] = [
  { id: "", name: "", price: 0, total: 0, unit: "kg", customUnit:"", scopeOfMaterial: "",
    description: "", nameError: false, dateError: false },
]

const InventoryPage: React.FC = () => {
  const [inventoryData, setInventoryData] = useState(initialInventoryData);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const unitOptions = ["kg", "pieces", "metre", "litre", "gram", "box", "feet" , "Custom Unit"];

  const handleInputChange = (
    index: number,
    field: keyof Inventory,
    value: string | number
  ) => {
    setInventoryData((prevInventory) =>
      prevInventory.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          [field]: value,
          total: field === "price" ? Number(value) : item.total,
        };
      })
    );
  };

 
  const handleUnitChange = (index: number, unit: string) => {
    setInventoryData((prevInventory) =>
      prevInventory.map((item, i) =>
        i === index
          ? { ...item, unit, customUnit: unit === "Custom Unit" ? "" : undefined }
          : item
      )
    );
  };
  const handleAddRow = () => {
    setInventoryData((prevInventory) => [
      ...prevInventory,
      {id: "", materialId: 0, name: "",description: "", price: 0, availableQuantity: 1, total: 0, unit: "kg", customUnit: "", scopeOfMaterial: "",
        nameError: false, dateError: false },
    ]);
  };

  const handleCustomUnitChange = (index: number, value: string) => {
    setInventoryData((prevInventory) =>
      prevInventory.map((item, i) =>
        i === index ? { ...item, customUnit: value } : item
      )
    );
  };

  const validateForm = (): boolean => {
    let isValid = true;

    setInventoryData((prevInventory) =>
      prevInventory.map((item) => {
        const nameError = !item.name.trim();

        if (nameError) isValid = false;

        return { ...item, nameError};
      })
    );
    return isValid
  };

  const handleSubmit = async () => {
    if (loading) return; 

    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
  
    try {
      const formData = new FormData();
  
        const jsonData = inventoryData.map(({ nameError, dateError, customUnit, ...item }) => ({
          ...item,
          name: item.name, 
          unit: customUnit && customUnit.trim() ? customUnit : item.unit, // Use customUnit if valid, otherwise keep predefined unit
          description: item.description,
          scopeOfMaterial: item.scopeOfMaterial,

        }));
          
      if (!jsonData.length) {
        alert("Inventory data cannot be empty.");
        setLoading(false);
        return;
      }
  
      formData.append("inventory", JSON.stringify(jsonData));
  
      console.log("JSON Data to Backend:", jsonData);
  
      const response = await axiosInstance.post("/inventory/addmaterial", jsonData);
  
      if (response.status === 200) {
        alert("Data submitted successfully!");
        navigate("/inventory/summary", { state: { inventoryData } });
      } else {
        console.error("Error Response:", response);
        alert("Failed to submit data. Please try again.");
      }
    } catch (error: any) {
      if (error.response) {
        console.error("Backend Error:", error.response.data);
        alert(`Error: ${error.response.data.message || "Unknown error occurred."}`);
      } else if (error.request) {
        console.error("Network Error:", error.message);
        alert("Network error. Please check your internet connection and try again.");
      } else {
        console.error("Error:", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleRemoveRow = (index: number) => {
    setInventoryData((prevInventory) => prevInventory.filter((_, i) => i !== index));
  };

  const grandTotal = inventoryData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 sm:p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-6 text-lg sm:text-xl font-semibold text-black dark:text-white">
        Inventory Add New Items
      </h4>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1fr_1fr] gap-4 bg-gray-100 p-8 rounded-t-md">
        <div className="text-sm font-semibold">Name</div>
          <div className="text-sm font-semibold">Description</div>
          <div className="text-sm font-semibold">Unit</div>
          <div className="text-sm font-semibold">Material Category</div>
          <div className="text-sm font-semibold text-center">Actions</div>
        </div>

        {inventoryData.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1fr_1fr] gap-6 items-center border-b border-stroke p-2 sm:p-4"

          >
            <div>
              <label className="block text-sm font-medium sm:hidden">Name</label>
              <input
                type="text"
                placeholder="Enter product name"
                value={item.name}
                onChange={(e) => handleInputChange(index, "name", e.target.value)}
                className={`w-full rounded border px-2 py-1 ${
                  item.nameError ? "border-red-500" : "border-gray-300 dark:border-strokedark"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium sm:hidden">Description</label>
              <input
                type="text"
                placeholder="Enter description"
                value={item.description}
                onChange={(e) => handleInputChange(index, "description", e.target.value)}
                className="w-full rounded border px-2 py-1 border-gray-300 dark:border-strokedark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium sm:hidden">Unit</label>
              {item.unit === "Custom Unit" ? (
                <input
                  type="text"
                  placeholder="Enter custom unit"
                  value={item.customUnit || ""}
                  onChange={(e) => handleCustomUnitChange(index, e.target.value)}
                  className="w-24 sm:w-32 rounded border px-2 py-1 border-gray-300 dark:border-strokedark"
                  />
              ) : (
                <select
                  value={item.unit}
                  onChange={(e) => handleUnitChange(index, e.target.value)}
                  className="w-24 sm:w-32 rounded border px-2 py-1 border-gray-300 dark:border-strokedark"
                  >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium sm:hidden">Material Category</label>
              <input
                type="text"
                placeholder="Enter material category"
                value={item.scopeOfMaterial}
                onChange={(e) => handleInputChange(index, "scopeOfMaterial", e.target.value)}
                className="w-full rounded border px-2 py-1 border-gray-300 dark:border-strokedark"
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => handleRemoveRow(index)}
                className="px-2 sm:px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Add Row Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleAddRow}
            className="w-8 h-8 text-lg font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-lg font-semibold">Grand Total:</span>
        <span className="text-lg font-semibold">₹{grandTotal.toFixed(2)}</span>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-md bg-primary py-2 px-10 font-medium text-white ${
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