import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  name: string; // Used as "Name"
  nameError: boolean;
  descriptionError: boolean;
  amountError: boolean;
  dateError: boolean;
  attachment: File | null;
  attachmentError: boolean;
}

const initialExpenseData: Expense[] = [
  {
    id: "",
    description: "",
    amount: 0,
    date: "",
    name: "",
    nameError: false,
    descriptionError: false,
    amountError: false,
    dateError: false,
    attachment: null,
    attachmentError: false,
  },
];

const ExpenseVoucherPage: React.FC = () => {
  const [expenseData, setExpenseData] = useState(initialExpenseData);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    index: number,
    field: keyof Expense,
    value: string | number
  ) => {
    setExpenseData((prevExpenses) =>
      prevExpenses.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleFileChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and PDF files are allowed.");
        return;
      }
      setExpenseData((prevExpenses) =>
        prevExpenses.map((item, i) =>
          i === index ? { ...item, attachment: file } : item
        )
      );
    }
  };

  const handleAddRow = () => {
    setExpenseData((prevExpenses) => [
      ...prevExpenses,
      {
        id: "",
        description: "",
        amount: 0,
        date: "",
        name: "",
        nameError: false,
        descriptionError: false,
        amountError: false,
        dateError: false,
        attachment: null,
        attachmentError: false,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setExpenseData((prevExpenses) =>
      prevExpenses.filter((_, i) => i !== index)
    );
  };

  const handleSubmitRow = async (index: number) => {
    const row = expenseData[index];
  
    // Validate fields
    const nameError = !row.name.trim();
    const amountError = row.amount <= 0;
    const dateError = !row.date.trim();
    const descriptionError = !row.description.trim();
    const attachmentError = !row.attachment;
  
    const updatedRow = { ...row, nameError, amountError, dateError, descriptionError, attachmentError };
  
    setExpenseData((prevExpenses) =>
      prevExpenses.map((item, i) => (i === index ? updatedRow : item))
    );
  
    if (nameError || amountError || dateError || descriptionError || attachmentError) {
      return;
    }
  
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append file
      formData.append("file", row.attachment as File);
  
      // Correctly formatting `voucherRequestDTO` as a string
      formData.append("voucherRequestDTO", JSON.stringify({
        employeeId: 1, // Adjust this dynamically if needed
        name: row.name,
        description: row.description,
        voucherDate: row.date,
        amount: row.amount,
      }));
  
      const response = await axiosInstance.post("/expense-vouchers/upload", formData, {
        headers: {
          
          "Content-Type": "multipart/form-data", 
        },
      });
  
      if (response.status === 200) {
        setExpenseData((prevExpenses) => prevExpenses.filter((_, i) => i !== index));
      } else {
        alert("Error: " + response.data);
      }
    } catch (error: any) {
      console.error("Error submitting row:", error);
      alert("Failed to submit expense voucher for this row. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const totalExpense = expenseData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Expense Voucher
      </h4>
  
      <div className="flex flex-col relative">
        {/* Grid Header */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr_1fr_1fr] rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Name</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Amount</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Date</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Description</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Attachment</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
          </div>
        </div>
  
        {expenseData.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1fr_1fr_1.5fr_1fr_1fr] border-b border-stroke dark:border-strokedark"
          >
            {/* Name Column */}
            <div className="p-2.5 xl:p-5">
              <input
                type="text"
                placeholder="Enter name"
                value={item.name}
                onChange={(e) => handleInputChange(index, "name", e.target.value)}
                className={`w-full rounded border px-2 py-1 ${
                  item.nameError ? "border-red-500" : "border-gray-300 dark:border-strokedark"
                }`}
              />
            </div>
            {/* Amount Column */}
            <div className="p-2.5 xl:p-5">
              <input
                type="number"
                placeholder="Enter amount"
                value={item.amount || ""}
                onChange={(e) =>
                  handleInputChange(index, "amount", parseFloat(e.target.value) || 0)
                }
                className={`w-full rounded border px-2 py-1 ${
                  item.amountError ? "border-red-500" : "border-gray-300 dark:border-strokedark"
                }`}
              />
            </div>
            {/* Date Column */}
            <div className="p-2.5 xl:p-5">
              <input
                type="date"
                value={item.date}
                onChange={(e) => handleInputChange(index, "date", e.target.value)}
                className={`w-full rounded border px-2 py-1 ${
                  item.dateError ? "border-red-500" : "border-gray-300 dark:border-strokedark"
                }`}
              />
            </div>
            {/* Description Column (Increased Width) */}
            <div className="p-2.5 xl:p-5 col-span-1.5">
              <input
                type="text"
                placeholder="Enter description"
                value={item.description}
                onChange={(e) => handleInputChange(index, "description", e.target.value)}
                className={`w-full rounded border px-2 py-1 ${
                  item.descriptionError ? "border-red-500" : "border-gray-300 dark:border-strokedark"
                }`}
              />
            </div>
            {/* Attachment Column */}
            <div className="p-2.5 xl:p-5">
              <input
                type="file"
                onChange={(e) => handleFileChange(index, e)}
                className={`w-full rounded border px-2 py-1 ${
                  item.attachmentError ? "border-red-500" : "border-gray-300 dark:border-strokedark"
                }`}
              />
            </div>
            {/* Actions Column */}
            <div className="p-2.5 xl:p-5 flex gap-2">
              <button
                onClick={() => handleSubmitRow(index)}
                className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                disabled={loading}
              >
                Submit
              </button>
              <button
                onClick={() => handleRemoveRow(index)}
                className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
  
        <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleAddRow}
            className="w-6 h-6 text-md font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
  
      <div className="flex justify-between p-3 font-semibold text-black dark:text-white">
        <span>Total Expense:</span>
        <span>₹{totalExpense.toFixed(2)}</span>
      </div>
    </div>
  );
  
};

export default ExpenseVoucherPage;
