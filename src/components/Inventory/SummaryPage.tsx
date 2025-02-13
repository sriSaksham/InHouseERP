import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Inventory } from "../../types/inventory";

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [inventoryData, setInventoryData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axiosInstance.get("/inventory/materials");
        setInventoryData(response.data); // Assuming the response matches expected structure
      } catch (error: any) {
        console.error("Axios Error:", error.message);
        if (error.response) {
          console.error("Response Status:", error.response.status);
          console.error("Response Data:", error.response.data);
        } else if (error.request) {
          console.error("Request made but no response received:", error.request);
        } else {
          console.error("Error Message:", error.message);
        }
            
        setError("Failed to load inventory data.");
      } finally {
        setLoading(false);
      }
      
    };
  
    fetchInventory();
  }, []);
  

  if (loading) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold text-red-500">{error}</h2>
        <button
          onClick={() => navigate("/inventory")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold">No Data Available</h2>
        <button
          onClick={() => navigate("/inventory")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-6">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Inventory 
      </h4>
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Summary Page</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border border-gray-300 shadow-default dark:border-strokedark dark:bg-boxdark">
          <thead>
            <tr className="bg-gray-100 text-left shadow-default dark:border-strokedark dark:bg-boxdark">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Unit</th>
              <th className="py-2 px-4 border-b">Price</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.name || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.description || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.unit || "N/A"}</td>
                <td className="py-2 px-4 border-b">₹{item.price || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/inventory")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:border-strokedark dark:bg-boxdark"
        >
          Add Quantity
        </button>
      </div>
      
      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/request-items", { state: { inventoryData } })}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:border-strokedark dark:bg-boxdark"
        >
          Request Items
        </button>
      </div>
    </div>
    </div>
  );
};

export default SummaryPage;
