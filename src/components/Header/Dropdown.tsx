import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance"; 
import { useSite } from "../SiteContext/SiteContext"


type Branch = {
  id: number; 
  name: string; 
};



const BranchDropdown = ({
  onBranchSelect,
}: {
  onBranchSelect: (branch: Branch) => void; // Use Branch type here
}) => {  

  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { siteId, setSiteId } = useSite(); // Access the global site state and its updater

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get("/branches");
        setBranches(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching branches:", err);
        setError("Failed to load branches. Please try again.");
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value);
    const selectedBranch = branches.find((branch) => branch.id === selectedId);

    if (selectedBranch) {
      setSiteId(selectedBranch.id);
      onBranchSelect(selectedBranch);
    }
  };

  return (
    <div className="relative">
      <label htmlFor="branch-dropdown" className="block text-sm font-medium mb-2">
      </label>
      {loading ? (
        <div className="text-gray-500">Loading branches...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <select
        id="branch-dropdown"
          value={siteId || ""} 
          onChange={handleChange}
          className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="" disabled>
            -- Select a branch --
          </option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default BranchDropdown;
