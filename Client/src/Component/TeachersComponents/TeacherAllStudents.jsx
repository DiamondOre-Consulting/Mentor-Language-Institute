import React from 'react'
import { Link } from 'react-router-dom'

const TeacherAllStudents = () => {
    
    return (
        <>

            <h1 className='text-4xl mb-1 font-semibold text-center'>All Students</h1>
            <div className='w-44 rounded h-1 bg-orange-500 text-center mb-8 mx-auto'></div>

            <div className='grid grid-cols-4 gap-2'>
                <a href="#" class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Hania</h5>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Total Hours :- <span>24hrs</span></p>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Schedule :- <span>M/W/F</span></p>
                 
                </a>
            </div>

        </>
    )
}

export default TeacherAllStudents