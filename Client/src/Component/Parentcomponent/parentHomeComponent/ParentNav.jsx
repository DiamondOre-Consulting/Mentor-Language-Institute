import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const ParentNav = () => {


    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleToggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (
        <>
            <div className='bg-black w-full h-8 p-2 flex items-center justify-end'>
                <ul className=''>
                    <li className='text-white mr-8'>Logout</li>
                </ul>
            </div>
            <nav className="">
                {/* <div className="max-w-screen-xl flex flex-wrap items-center justify-center p-2 "> */}
                    {/* <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="https://mentorlanguage.com/wp-content/uploads/2022/12/img68.jpg" className="h-20" alt="CV Genie Logo" />
                    </a> */}
                    {/* <button
                        onClick={handleToggleMenu}
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-100 rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-expanded={isMenuOpen ? "true" : "false"}
                        aria-controls="navbar-default"
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button> */}
                    {/* <div className={`w-full md:flex md:items-center md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`} id="navbar-default">
                    <ul className="items-center font-sm flex flex-col p-4 md:p-0 mt-4 border border-0 md:border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">

                    <li className='flex flex-col items-center'><div className='rounded-full border h-16 w-16 border-1 border-black ' style={{backgroundImage:"url('https://pics.craiyon.com/2023-06-04/50f169348eb24ce0919dba8133c08ddc.webp')",backgroundPosition:"center",backgroundSize:"cover"}}></div>
                        <p>Hania Amir</p>
                    </li>
                      
                    </ul> 
                </div> */}
                {/* </div> */}
                {/* <div className='bb-1 border border-gray-500'></div> */}
            </nav>


        </>
    )
}

export default ParentNav