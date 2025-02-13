import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Logo from '../../images/logo/logo.png';
import axiosInstance from '../../utils/axiosInstance';

type FormData = {
  name: string;
  age: string;
  permanentAddress: string;
  aadhaarNum: string;
  pan: string;
  epfoId: string;
  esiId: string;
  mobileNum: string;
  altMobileNum: string;
  bankName: string;
  accNum: string;
  ifscCode: string;
  department: string;
  position: string;
  salary: string;
  emailId: string;
  password: string;
  role: string;
};

type Errors = Partial<Record<keyof FormData, string>> & {
  apiError?: string;
};

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    permanentAddress: '',
    aadhaarNum: '',
    pan: '',
    epfoId: '',
    esiId: '',
    mobileNum: '',
    altMobileNum: '',
    bankName: '',
    accNum: '',
    ifscCode: '',
    department: '',
    position: '',
    salary: '',
    emailId: '',
    password: '',
    role: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "mobileNum" && value.length > 10) {
      alert("Mobile number must be 10 digits or less.");
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): Errors => {
    const validationErrors: Errors = {};
    if (!formData.name) validationErrors.name = 'Name is required';
    if (!formData.emailId) validationErrors.emailId = 'Email is required';
    if (!formData.password) validationErrors.password = 'Password is required';
    if (!formData.mobileNum) validationErrors.mobileNum = 'Mobile number is required';
    if (!formData.department) validationErrors.department = 'Department is required';
    return validationErrors;
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      mobileNum: String(formData.mobileNum),
      altMobileNum: String(formData.altMobileNum),
      accNum: String(formData.accNum),
    };
    
    console.log("Payload sent to backend:", payload);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      console.log("Form Data being sent to backend:", formData); // Log the form data being sent
      const response = await axiosInstance.post('employees/register', formData);
      console.log("Response from backend:", response.data); // Log the response from the backend
      setSuccessMessage('Account created successfully!');
      setFormData({
        name: '',
        age: '',
        permanentAddress: '',
        aadhaarNum: '',
        pan: '',
        epfoId: '',
        esiId: '',
        mobileNum: '',
        altMobileNum: '',
        bankName: '',
        accNum: '',
        ifscCode: '',
        department: '',
        position: '',
        salary: '',
        emailId: '',
        password: '',
        role: '',
      });
    } catch (error: any) {
      console.error("Error during API request:", error.response?.data || error.message); // Log the error
      setErrors({ apiError: error.response?.data?.message || 'Something went wrong' });
    }
  };
  
  return (
    <>
       <Breadcrumb pageName="Sign Up" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
        <div className="hidden w-full xl:block xl:w-12/2 bg-gray-100 dark:bg-gray-800 p-8 text-center">
        <Link to="/" className="inline-block mb-5">
        <img
  src={Logo}
  alt="Logo"
  height={90} // Set the desired height
  width={150}  // Set the desired width
/>
           </Link>
              <p className="text-gray-600 dark:text-gray-300">
              Welcome to the sign-up page. Please fill in your details to create an account.
              </p>
            </div>
          </div>
          <div className="w-full xl:w-12/2 p-6 sm:p-12 xl:p-16">
            <h2 className="text-2xl font-bold text-center text-black dark:text-white mb-6">
              Add Employee
            </h2>
            {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
            {errors.apiError && <p className="text-red-500 text-center">{errors.apiError}</p>}


            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 md:grid-cols-3 gap-12">
                {[
                  { label: 'Name', name: 'name', type: 'text', placeholder: 'Enter your full name' },
                  { label: 'Age', name: 'age', type: 'number', placeholder: 'Enter your age' },
                  { label: 'Permanent Address', name: 'permanentAddress', type: 'text', placeholder: 'Enter your address' },
                  { label: 'Aadhaar Number', name: 'aadhaarNum', type: 'text', placeholder: 'Enter your Aadhaar' },
                  { label: 'PAN', name: 'pan', type: 'text', placeholder: 'Enter your PAN' },
                  { label: 'EPFO ID', name: 'epfoId', type: 'text', placeholder: 'Enter EPFO ID' },
                  { label: 'ESI ID', name: 'esiId', type: 'text', placeholder: 'Enter ESI ID' },
                  { label: 'Mobile Number', name: 'mobileNum', type: 'text', placeholder: 'Enter mobile number' },
                  { label: 'Alternate Mobile', name: 'altMobileNum', type: 'text', placeholder: 'Enter alternate mobile' },
                  { label: 'Bank Name', name: 'bankName', type: 'text', placeholder: 'Enter bank name' },
                  { label: 'Account Number', name: 'accNum', type: 'text', placeholder: 'Enter account number' },
                  { label: 'IFSC Code', name: 'ifscCode', type: 'text', placeholder: 'Enter IFSC' },
                  { label: 'Department', name: 'department', type: 'text', placeholder: 'Enter department' },
                  { label: 'Position', name: 'position', type: 'text', placeholder: 'Enter position' },
                  { label: 'Salary', name: 'salary', type: 'number', placeholder: 'Enter salary' },
                  { label: 'Email ID', name: 'emailId', type: 'email', placeholder: 'Enter email' },
                  { label: 'Password', name: 'password', type: 'password', placeholder: 'Enter password' },
                  { label: 'Role', name: 'role', type: 'select', options: ['Select Role', 'ROLE_ADMIN', 'ROLE_USER'] },
                ].map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name as keyof FormData]}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary lg:text-sm"
                      >
                        {field.options?.map((option, idx) => (
                          <option key={idx} value={option === 'Select Role' ? '' : option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name as keyof FormData]}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    )}
                    {errors[field.name as keyof FormData] && (
                                            <p className="text-red-500 text-xs mt-1">
                        {errors[field.name as keyof FormData]}</p>
                    )}
                  </div>
                ))}
                              </div>

                <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg shadow-md hover:bg-opacity-90 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                >
                  Create Account
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm">
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
    </>
  );
};
export default SignUp;
