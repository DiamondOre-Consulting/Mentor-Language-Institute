import React, { useState } from 'react';
import logo from '../../../assets/logo.png';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className='flex justify-between items-center pt-4 px-10'>
      <img src={logo} alt="Logo" className='w-32' />
      <ul className='relative'>
        <li>
          <button
            id="dropdownNavbarLink"
            onClick={toggleDropdown}
            className="text-gray-700  border-b border-gray-100 md:hover:bg-transparent md:border-0 pl-3 pr-4 py-2 md:hover:text-orange-400 md:p-0 font-medium flex items-center justify-between w-full md:w-auto"
          >
            Help ?
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
          {isDropdownOpen && (
            <div
              id="dropdownNavbar"
              className="absolute right-0 mt-2 bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow w-54"
            >
              <ul className="py-1" aria-labelledby="dropdownLargeButton">
                <li>
                  <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">+91-9999466159</a>
                </li>

              </ul>
              <div className="py-1">
                <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 text-wrap block px-4 py-2">mentor.languageclasses@gmail.com</a>
              </div>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
