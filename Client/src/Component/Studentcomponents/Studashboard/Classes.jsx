import React, { useState } from 'react'
import cbse from '..//..//..//assets/cbse.jpg'
import ib from '..//..//..//assets/ib.jpg'
import icse from '..//..//..//assets/icse.png'
import igcse from '..//..//..//assets/igcse.jpg'

const Classes = () => {

    const [popup, setPopUp] = useState(false)
    
    return (
        <div>

            <div className='mt-10'>
                <div className="bg-white py-4 sm:py-6">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto w-full lg:mx-0">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Classes Curriculam
                            </h2>
                            <p className=" text-lg leading-8 text-gray-600">
                                All Subjects
                            </p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-5 gap-2 gap-y-4 mt-10 mb-10 cursor-pointer' onClick={() => setPopUp(true)}>

                            <div className='border col-span-2 border-1 h-60 rounded-md relative'>
                                <div
                                    className='absolute inset-0 bg-cover bg-center rounded-md'
                                    style={{ backgroundImage: `url('https://png.pngtree.com/thumb_back/fh260/background/20230521/pngtree-desk-with-books-and-candles-in-front-of-skyline-image_2700508.jpg')` }}
                                ></div>

                                <div className='absolute inset-0 flex flex-col justify-center items-center text-white'>
                                    <h1 className='text-2xl font-bold'>Grade 1-10</h1>
                                    <p>All Subjects</p>
                                </div>
                            </div>

                            <div className='border col-span-3 border-1 h-60 rounded-md relative'>
                                <div
                                    className='absolute inset-0 bg-cover bg-center rounded-md'
                                    style={{ backgroundImage: `url('https://c4.wallpaperflare.com/wallpaper/504/398/329/historical-books-wallpaper-preview.jpg')` }}
                                ></div>

                                <div className='absolute inset-0 flex flex-col justify-center items-center text-white'>
                                    <h1 className='text-2xl font-bold'>Grade 11-12</h1>
                                    <p className='font-semibold'>Humanities, Accounts , Economics</p>
                                </div>
                            </div>



                        </div>



                    </div>



                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto w-full lg:mx-0">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                BOARDS
                            </h2>

                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2 gap-y-4 mt-10 mb-10 cursor-pointer' onClick={() => setPopUp(true)}>

                            <div className='md:col-span-4 lg:col-span-2 h-60 rounded-md' style={{ backgroundImage: `url(${cbse})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                            <div className='md:col-span-4 lg:col-span-3 h-60 rounded-md bg-right  md:bg-center' style={{ backgroundImage: `url(${ib})`, backgroundSize: "cover" }}></div>
                            <div className='md:col-span-4 lg:col-span-3 h-60 rounded-md bg-right  md:bg-center' style={{ backgroundImage: `url(${icse})`, backgroundSize: "cover" }}></div>
                            <div className='md:col-span-4 lg:col-span-2 h-60 rounded-md' style={{ backgroundImage: `url(${igcse})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>



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
        </div>
    )
}

export default Classes