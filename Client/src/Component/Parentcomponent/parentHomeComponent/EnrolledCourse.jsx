import React from 'react'
import { Link } from 'react-router-dom';
const EnrolledCourse = () => {
    
  return (
    <>

        <div className='px-10 -mt-36'>
            <h1 className='text-3xl font-semibold mt-10'>Enrolled Course</h1>
            <div className='py-8'>
                <div className='grid grid-cols-4 gap-8'>
                    <div className='grid grid-cols-4 border rounded-md shadow-md border-0'>
                        <div className='px-4 py-3 col-span-3 bg-orange-500 rounded-l-md'>
                            <span className='text-sm text-white'>Course</span>
                            <p className='text-xl font-bold text-white '>JavaScript Fundamentals</p>
                            <Link to={'/each/course'} className='text-gray-100 flex items-center text-sm mt-4'>Veiw <svg class="h-4 w-4 text-gray-100"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <polyline points="9 6 15 12 9 18" /></svg></Link>
                        </div>
                        <div className='flex justify-center border border-0'>
                            <div className='w-1 h-full bg-orange-500'></div>
                        </div>
                    </div>

                    <div className='grid grid-cols-4 border rounded-md shadow-md border-0'>
                        <div className='px-4 py-3 col-span-3 bg-orange-500 rounded-l-md'>
                            <span className='text-sm text-white'>Course</span>
                            <p className='text-xl font-bold text-white '>JavaScript Fundamentals</p>
                            <Link to={'/each/course'} className='text-gray-100 flex items-center text-sm mt-4'>Veiw <svg class="h-4 w-4 text-gray-100"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <polyline points="9 6 15 12 9 18" /></svg></Link>
                        </div>
                        <div className='flex justify-center border border-0'>
                            <div className='w-1 h-full bg-orange-500'></div>
                        </div>
                    </div>

                    <div className='grid grid-cols-4 border rounded-md shadow-md border-0'>
                        <div className='px-4 py-3 col-span-3 bg-orange-500 rounded-l-md'>
                            <span className='text-sm text-white'>Course</span>
                            <p className='text-xl font-bold text-white '>JavaScript Fundamentals</p>
                            <Link to={'/each/course'}className='text-gray-100 flex items-center text-sm mt-4'>Veiw <svg class="h-4 w-4 text-gray-100"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <polyline points="9 6 15 12 9 18" /></svg></Link>
                        </div>
                        <div className='flex justify-center border border-0'>
                            <div className='w-1 h-full bg-orange-500'></div>
                        </div>
                    </div>


                </div>
            </div>

        </div>
    </>
  )
}

export default EnrolledCourse