import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

interface QuantityView {
  siteId: number;
  materialId: number;
  availableQuantity: number;
  price: number;
  unit: string;
  name: string;
  description: string;
  siteName: string;
}
interface Branch {
  id: number;
  name: string;
}
const MaterialQuantitiesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<QuantityView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get('/branches');
        setBranches(response.data);
        if (response.data.length > 0) {
          setSelectedBranchId(response.data[0].id); // Default to the first branch
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Failed to load branches. Please try again.');
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId === null) return;

    const fetchMaterialQuantities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`inventory/materials/quantities/${selectedBranchId}`);
        console.log(response.data);
        setQuantities(response.data);
      } catch (err) {
        console.error('Error fetching material quantities:', err);
        setError('Failed to load material quantities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialQuantities();
  }, [selectedBranchId]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
       Admin
      </h4>
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Material Quantities</h2>

      {/* Site ID Selection */}
      <div className="mb-4 text-center">
        <label htmlFor="branch" className="mr-2">
          Select Branch:
        </label>
        <select
          id="branch"
          value={selectedBranchId || ''}
          onChange={(e) => setSelectedBranchId(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading material quantities...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : quantities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white border border-gray-300 shadow-default dark:border-strokedark dark:bg-boxdark">
            <thead className="bg-gray-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <tr>
                <th className="py-2 px-4 border-b text-left">Site</th>
                <th className="py-2 px-4 border-b text-left">Material ID</th>
                <th className="py-2 px-4 border-b text-left">Available Quantity</th>
                <th className="py-2 px-4 border-b text-left">Price</th>
                <th className="py-2 px-4 border-b text-left">Unit</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {quantities.map((quantity) => (
                <tr key={quantity.materialId} className="hover:bg-gray-50 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <td className="py-2 px-4 border-b">{quantity.siteName}</td>
                  <td className="py-2 px-4 border-b">{quantity.materialId}</td>
                  <td className="py-2 px-4 border-b">{quantity.availableQuantity}</td>
                  <td className="py-2 px-4 border-b">{quantity.price}</td>
                  <td className="py-2 px-4 border-b">{quantity.unit}</td>
                  <td className="py-2 px-4 border-b">{quantity.name}</td>
                  <td className="py-2 px-4 border-b">{quantity.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-600">No material quantities found for the selected site.</div>
      )}
    </div>
    </div>
  );
};

export default MaterialQuantitiesPage;
