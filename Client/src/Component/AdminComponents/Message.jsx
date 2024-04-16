import React from 'react'

const Message = () => {
  return (
    <>
    <div className='grid grid-cols-2 gap-16 '>

    

<div class=" relative py-6">
      <h1 class="text-3xl text-center font-bold text-orange-500">Recent Messages</h1>
      <div class="border-l-2 mt-10">
      
        <div class="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-2 bg-orange-500 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
         
          <div class="w-5 h-5 bg-orange-500 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

         
          <div class="w-10 h-1 bg-orange-300 absolute -left-10 z-0"></div>

         
          <div class="flex-auto">
            <h1 class="text-xl mb-1 font-bold">John</h1>
            <h1 class="text-sm font-bold">Applied For Javascript course</h1>
            <h3 className='text-xm text-gray-200'>12/3/2009</h3>
            <a href="#" class="float-right text-sm text-white hover:text-gray-300">Approve</a>
          </div>
          {/* <a href="#" class=" text-white hover:text-gray-300">Approved</a> */}
        </div>

      
        <div class="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-2 bg-orange-500 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
    
          <div class="w-5 h-5 bg-orange-500 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

         
          <div class="w-10 h-1 bg-orange-300 absolute -left-10 z-0"></div>

         
          <div class="flex-auto">
            <h1 class="text-xl mb-1 font-bold">John</h1>
            <h1 class="text-sm font-bold">Applied For Javascript course</h1>
            <h3 className='text-xm text-gray-200'>12/3/2009</h3>
            <a href="#" class="float-right text-sm text-white hover:text-gray-300">Approve</a>
          </div>
          {/* <a href="#" class="text-center text-white hover:text-gray-300">Download materials</a> */}
        </div>

       
      

        
        
       
        
      </div>
    
    </div>

    <div className='py-6'> 
        <h1 className='text-3xl text-center font-bold text-orange-500 mb-10'>Approved</h1>
        <div className='grid grid-cols-2 gap-4 '>
            <div className='border-1 border p-2 rounded-md  '>
                <p className='font-bold'>John</p>
                <p>Course :-<span>Reactjs</span></p>
                <p>Enrolled on :- <span>12/03/2005</span></p>
            </div>

            <div className='border border-1 p-2'>
                <p>John</p>
                <p>Course :-<span>Reactjs</span></p>
                <p>Enrolled on :- <span>12/03/2005</span></p>
            </div>

        </div>
    </div>
    </div>

    </>
  )
}

export default Message