import React from 'react'

const Allcourses = () => {
  return (
    <>
            <h1 className='text-4xl mb-1 font-semibold text-center'>All Courses</h1>
            <div className='w-44 rounded h-1 bg-orange-500 text-center mb-8 mx-auto'></div>
            
            <div className='grid grid-cols-4 gap-2'>

                
                <a href="#" class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">JavaScript</h5>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Teacher :- <span>John</span></p>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Duration :- <span>44hrs</span></p>
                    <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Total Enrolled Students :- <span>95</span></p>
                </a>
            </div>
    </>
  )
}

export default Allcourses