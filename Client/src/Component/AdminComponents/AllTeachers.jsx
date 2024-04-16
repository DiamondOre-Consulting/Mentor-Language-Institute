import React from 'react'
import { Link } from 'react-router-dom'

const AllTeachers = () => {

  return (
    <>


      <h1 className='text-4xl mb-1 font-semibold text-center'>All Teachers</h1>
      <div className='w-44 rounded h-1 bg-orange-500 text-center mb-16 mx-auto'></div>

      <div class=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-8 gap-8 mt-8">
        <Link to='/admin-dashboard/allteacher/eachteacher' href="#" class="flex flex-col items-center justify-center text-gray-800 hover:text-blue-600" title="View Profile">
          <img src="https://vojislavd.com/ta-template-demo/assets/img/connections/connection1.jpg" class="w-16 rounded-full"/>
            <p class="text-center font-bold text-sm mt-1">Diane Aguilar</p>
            <p class="text-xs text-gray-500 text-center">UI/UX Design at Upwork</p>
        </Link>

        <Link to='/admin-dashboard/allteacher/eachteacher' href="#" class="flex flex-col items-center justify-center text-gray-800 hover:text-blue-600" title="View Profile">
          <img src="https://vojislavd.com/ta-template-demo/assets/img/connections/connection1.jpg" class="w-16 rounded-full"/>
            <p class="text-center font-bold text-sm mt-1">Diane Aguilar</p>
            <p class="text-xs text-gray-500 text-center">UI/UX Design at Upwork</p>
        </Link>
       
        
      </div>

     

    </>

  )
}

export default AllTeachers