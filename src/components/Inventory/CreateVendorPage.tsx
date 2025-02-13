import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const CreateVendorPage: React.FC = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vendorData = {
        name,
        address,
        contactNumber,
        email,
        gstNumber,
        panNumber,
      };

      const response = await axiosInstance.post("/vendors/create", vendorData);
      console.log("Vendor created:", response.data);

      alert("Vendor created successfully!");
      setName("");
      setAddress("");
      setContactNumber("");
      setEmail("");
      setGstNumber("");
      setPanNumber("");
    } catch (err: any) {
      console.error("Error creating vendor:", err);
      setError("Failed to create vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 border rounded-md bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Add New Vendor</h2>

      {/* Name */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Vendor name"
        />
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Vendor address"
        />
      </div>

      {/* Contact Number */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Contact Number</label>
        <input
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Vendor contact number"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Vendor email"
        />
      </div>

      {/* GST Number */}
      <div className="mb-4">
        <label className="block font-medium mb-1">GST Number</label>
        <input
          type="text"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="GST Number"
        />
      </div>

      {/* PAN Number */}
      <div className="mb-4">
        <label className="block font-medium mb-1">PAN Number</label>
        <input
          type="text"
          value={panNumber}
          onChange={(e) => setPanNumber(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="PAN Number"
        />
      </div>

      {/* Error Display */}
      {error && (
        <p className="text-red-500 mb-4">
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Creating..." : "Create Vendor"}
      </button>
    </div>
  );
};

export default CreateVendorPage;
