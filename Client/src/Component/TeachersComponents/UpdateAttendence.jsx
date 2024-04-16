import React, { useState } from 'react'

const UpdateAttendence = () => {

    const [isFirstIconVisible, setIsFirstIconVisible] = useState(true);

    const toggleIcons = () => {
        setIsFirstIconVisible(!isFirstIconVisible);
    };

    return (
        <>

            <div>


                <span className='font-bold mr-2 text-xl'>Select Date:- </span><input type='date' />


            </div>
            <div class="flex flex-col md:flex-row  h-full px-0 py-4">


                <div class="w-full flex flex-col h-fit gap-4 p-4 ">
                    <p class="text-orange-500 text-xl font-extrabold">My Students</p>


                    <div class="flex flex-col p-4 text-lg font-semibold shadow-md border rounded-sm">
                        <div class="flex flex-col md:flex-row gap-3 justify-between">

                            <div class="flex flex-row gap-6 items-center">
                                {/* <div class="w-28 h-28">
                                    <img class="w-full h-full" src="https://static.netshoes.com.br/produtos/tenis-adidas-coreracer-masculino/09/NQQ-4635-309/NQQ-4635-309_zoom1.jpg?ts=1675445414&ims=544x" />
                                </div> */}
                                <div class="flex flex-col gap-1">
                                    <p class="text-lg text-gray-800 font-semibold">Hania Amir</p>
                                    <p class="text-xs text-gray-600 font-semibold">Phone: <span class="font-normal">+91 454543353</span></p>
                                    {/* <p class="text-xs text-gray-600 font-semibold">Size: <span class="font-normal">42</span></p> */}
                                </div>
                            </div>



                            <div class="self-center">
                                <button class=" " onClick={toggleIcons}>
                                    {isFirstIconVisible ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 16 16">
                                            <path fill="#07b059" fillRule="evenodd" d="M13.5 8a5.5 5.5 0 1 1-11 0a5.5 5.5 0 0 1 11 0M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M6.75 5a.75.75 0 0 0-.75.75v5a.75.75 0 0 0 1.5 0V9.5h1a2.25 2.25 0 0 0 0-4.5zm2.5 2.25A.75.75 0 0 1 8.5 8h-1V6.5h1a.75.75 0 0 1 .75.75" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 16 16">
                                            <path fill="#07b059" fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m3.1-8.55a.75.75 0 1 0-1.2-.9L7.419 8.858L6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>


                    </div>
                </div>


                <div class="flex flex-col w-full md:w-2/3 h-fit gap-4 p-4">
                    <p class="text-orange-500 text-xl font-extrabold">Total Attendence</p>
                    <div class="flex flex-col p-4 gap-4 text-lg font-semibold shadow-md border rounded-sm">
                        <div class="flex flex-row justify-between">
                            <p class="text-gray-600">Total Students</p>
                            <p class="text-end font-bold">30</p>
                        </div>
                        <hr class="bg-gray-200 h-0.5" />
                        <div class="flex flex-row justify-between">
                            <p class="text-gray-600">Present</p>
                            <div>
                                <p class="text-end font-bold">20</p>

                            </div>
                        </div>
                        <hr class="bg-gray-200 h-0.5" />
                        <div class="flex flex-row justify-between">
                            <p class="text-gray-600">Absent</p>
                            <div>
                                <p class="text-end font-bold">10</p>

                            </div>
                        </div>
                      
                    </div>
                    
                    
                   
                </div>
            </div>

        </>
    )
}

export default UpdateAttendence