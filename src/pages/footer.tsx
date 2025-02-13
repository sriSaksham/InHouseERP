import React from "react";
import { Link } from "react-router-dom";
import animatedLogo from "../images/logo/finalvidi.gif"; 

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-0">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        {/* Left Side - Logo */}
        <div className="flex items-center">
        <img src={animatedLogo} alt="Company Logo" className="h-16 mr-3" />
        {/* <span className="text-lg font-semibold">Saanvi Technology Solutions</span> */}
        </div>

        {/* Center - Copyright */}
        <div className="text-center md:text-left mt-4 md:mt-0">
          <p>© {new Date().getFullYear()} SMM Infratech | Powered by Saanvi Technology Solutions | All rights reserved.</p>
        </div>

        {/* Right Side - Developer Credit */}
        <div className="mt-4 md:mt-0">
          <p>
            Developed by{" "}
            <Link to="https://saanvitechs.com/" target="_blank" className="text-blue-400 hover:underline">
              STS
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
