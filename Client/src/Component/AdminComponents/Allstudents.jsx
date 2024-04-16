import React from 'react'
import { Link } from 'react-router-dom'



const Allstudents = () => {

    

    return (
        <>
           
            <h1 className='text-4xl mb-1 font-semibold text-center'>All Students</h1>
            <div className='w-44 rounded h-1 bg-orange-500 text-center mb-8 mx-auto'></div>
            
            <div className='grid grid-cols-4 gap-2'>
                <a href="#" class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Zoya siddiqui</h5>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Course Title :- <span>JavaScript</span></p>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Teacher Name :- <span>John</span></p>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Total Hours :- <span>24hrs</span></p>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Schedule :- <span>M/W/F</span></p>
                    <Link to={'/admin-dashboard/allstudents/eachstudent'} className=' text-sm text-orange-500 flex items-center  text-md mt-4 justify-end '>Veiw <svg class="h-4 w-4 text-orange-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <polyline points="9 6 15 12 9 18" /></svg></Link>
                </a>
            </div>

        </>
    )
}

export default Allstudents