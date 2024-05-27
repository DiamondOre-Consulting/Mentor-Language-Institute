import React, { useState } from 'react'
import ielts from '..//..//..//assets/ielts.jpg'
import sat from '..//..//..//assets/sat.jpg'
import toefl from '..//..//..//assets/toefl.jpg'
import ap from '..//..//..//assets/ap.jpg'
import english from '..//..//..//assets/english.webp'
import personality from '..//..//..//assets/persnality.webp'
import cuet from '..//..//..//assets/cuet1.jpg'

const SpecialCourses = () => {
    const [popup, setPopUp] = useState(false)

    return (
        <>
            <div>
                <div className='mt-24'>
                    <div className="bg-white py-4 sm:py-6">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto w-full lg:mx-0">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    Special Courses
                                </h2>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 gap-y-4 mt-10 mb-0 cursor-pointer' onClick={() => setPopUp(true)}>
                                <div className='border border-1 h-60 rounded-md ' style={{ backgroundImage: `url(${ielts})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${sat})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${toefl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${ap})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${cuet})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}></div>
                                <div className='border border-1 h-60 rounded-md bg-top md:bg-center' style={{ backgroundImage: `url(${english})`, backgroundSize: "cover" }}></div>
                                <div className='border border-1 h-60 rounded-md md:col-span-3 bg-no-repeat' style={{ backgroundImage: `url(${personality})`, backgroundSize: "contain", backgroundPosition: "center" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {popup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

                    <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                        role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                        <div class="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                            <button type="button" onClick={()=> setPopUp(false)} data-behavior="cancel" class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span class="sr-only">Close</span>
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg class="h-6 w-6 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                   Please Contact To The Institute Directly !!
                                </h3>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500">
                                        Call us : +91 9999466159
                                    </p>
                                    <p class="text-sm text-gray-500">
                                       Email : mentor.languageclasses@gmail.com
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button type="button" onClick={()=> setPopUp(false)} data-behavior="commit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-400 text-base font-medium text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Close
                            </button>
                           
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SpecialCourses;
