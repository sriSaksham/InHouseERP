import { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import CoverOne from '../images/cover/cover-01.png';
import AdminIcon from '../images/logo/admin1.svg';
import UserIcon from '../images/logo/user1.svg';
import DefaultIcon from '../images/logo/user.svg'
import axiosInstance from "../utils/axiosInstance";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUpload } from '@fortawesome/free-solid-svg-icons';


const Profile = () => {
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('name') || 'Your Name';
    const storedRole = localStorage.getItem('role') || 'Your Role';

    setName(storedName);
    setRole(storedRole);
    const employeeId = localStorage.getItem('userId') || '1';
    fetchEmployeeDetails(employeeId);
    fetchProfileImage(employeeId); 
  }, []);

  const fetchEmployeeDetails = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/employees/${id}`);
      setEmployeeDetails(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const fetchProfileImage = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/employees/view-profile-photo/${id}`, {
        responseType: "arraybuffer",
      });
      const imageBlob = new Blob([response.data], { type: response.headers["content-type"] });
      const imageUrl = URL.createObjectURL(imageBlob);
      setProfileImage(imageUrl);
    } catch (error) {
      console.warn("No profile image found, using default:", error);
      setProfileImage(null); 
    }
  };
  const getRoleIcon = () => {
    if (role === 'ROLE_ADMIN') {
      return AdminIcon;
    } else if (role ==='ROLE_USER') {
      return UserIcon;
    }
    return DefaultIcon;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
  
    const employeeId = localStorage.getItem('userId');
    if (!employeeId) {
      alert("User ID not found.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("id", employeeId);
  
    try {
      await axiosInstance.post("/employees/upload-profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Profile photo uploaded successfully!");
  
      setIsModalOpen(false);
      setSelectedFile(null);
  
      fetchProfileImage(employeeId); 
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed. Please try again.");
    }
  };
  
  return (
    <>
      <Breadcrumb pageName="Profile" />
  
      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Profile Cover Section */}
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverOne}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          />
        </div>
  
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          {/* Profile Image Section */}
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="flex items-center justify-center h-full w-full relative">
              {/* Profile Image: Either fetched from API or fallback to default icon */}
              <img
                src={profileImage || getRoleIcon()} 
                alt="profile"
                className="h-30 w-30 rounded-full object-cover"
              />
  
              {/* Camera Icon Button */}
              <button
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 transition-all"
                onClick={() => setIsModalOpen(true)}
              >
                <FontAwesomeIcon icon={faCamera} className="text-gray-700 h-5 w-5" />
              </button>
            </div>
          </div>
  
          {/* Profile Name and Role */}
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">{name}</h3>
            <p className="font-medium">{role}</p>
          </div>
  
          {/* Employee Details Section */}
          {employeeDetails && (
            <div className="mt-8">
              <h2 className="font-extrabold text-black dark:text-white mb-8">EMPLOYEE DETAILS</h2>
              <div className="grid grid-cols-4 gap-4 text-left">
                <div>
                  <span className="font-medium text-black dark:text-white">Name:</span> {employeeDetails.name}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Age:</span> {employeeDetails.age}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Address:</span> {employeeDetails.permanentAddress}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Aadhar:</span> {employeeDetails.aadhaarNum}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">PAN:</span> {employeeDetails.pan}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">EPFO ID:</span> {employeeDetails.epfoId}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">ESI ID:</span> {employeeDetails.esiId}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Mobile:</span> {employeeDetails.mobileNum}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Alt Mobile:</span> {employeeDetails.altMobileNum}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Account:</span> {employeeDetails.accNum}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">IFSC:</span> {employeeDetails.ifscCode}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Department:</span> {employeeDetails.department}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Position:</span> {employeeDetails.position}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Salary:</span> {employeeDetails.salary}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Email:</span> {employeeDetails.emailId}
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Bank:</span> {employeeDetails.bankName}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* Modal for File Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Update Profile Picture</h2>
  
            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              className="mb-4 w-full border p-2 rounded"
              onChange={handleFileChange}
            />
  
            {/* Modal Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleUpload}
              >
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
  
};

export default Profile;