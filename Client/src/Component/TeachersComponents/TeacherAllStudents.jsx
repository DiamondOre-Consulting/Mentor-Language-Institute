import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const TeacherAllStudents = () => {

    const [ShowMarkTodayAttendence, SetShowMarkTodayAttendence] = useState(false);
    const HandleCloseMarkedAttendence = () => {
        SetShowMarkTodayAttendence(false)
    };

    return (
        <>
            <select className='float-right'>
                <option>Change Course</option>
                <option>JAVA</option>
                <option>CSS</option>
            </select>
            <h1 className='text-4xl mb-1 font-semibold text-start'>Enrolled Students</h1>

            <div className='w-44 rounded h-1 bg-orange-500 text-start mb-8 '></div>

            <div className='grid grid-cols-2 gap-2'>
                <a href="#" class="block max-w-sm  bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <div className='px-4 pt-2'>
                        <h5 class="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Hania</h5>
                        <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Phone:- <span>+91 438957385</span></p>
                    </div>
                    <div>
                        <p className='font-bold bg-orange-500 text-gray-100 mt-1  px-4 py-1 w-full'>Attendence</p>
                        <div className='grid grid-cols-4 gap-1 '>
                            <div className='border border-1 text-sm px-1 bg-green-300 cursor-pointer'>12/03/2003</div>
                            <div className='border border-1 text-sm px-1 bg-red-300 cursor-pointer' onClick={() => SetShowMarkTodayAttendence(true)}>12/03/2009</div>
                            <div className='border border-1 text-sm px-1 cursor-pointer'onClick={() => SetShowMarkTodayAttendence(true)}>12/03/2008</div>

                        </div>
                    </div>
                </a>

            </div>

            {ShowMarkTodayAttendence && (
                <div className="fixed inset-0 flex items-center justify-center">

                    <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/6">
                        <div className="p-6 text-left ">
                            <div className='flex  items-center justify-between mt-2'>
                                <div>
                                    <a onClick={HandleCloseMarkedAttendence} className='p-2 bg-green-500 rounded-md text-gray-100 cursor-pointer'>Present</a>
                                </div>
                                <div>
                                    <p onClick={HandleCloseMarkedAttendence} className='p-2 bg-red-400 rounded-md text-gray-100 cursor-pointer'>Absent</p>
                                </div>

                            </div>


                        </div>
                    </section>
                </div>
            )}

        </>
    )
}

export default TeacherAllStudents