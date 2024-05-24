import React from 'react'
import cbse from '..//..//..//assets/cbse.jpg'
import ib from '..//..//..//assets/ib.jpg'
import icse from '..//..//..//assets/icse.png'
import igcse from '..//..//..//assets/igcse.jpg'

const Classes = () => {
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

                        <div className='grid grid-cols-1 md:grid-cols-5 gap-2 gap-y-4 mt-10 mb-10'>

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

                        <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2 gap-y-4 mt-10 mb-10'>

                            <div className='md:col-span-4 lg:col-span-2 h-60 rounded-md' style={{ backgroundImage: `url(${cbse})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                            <div className='md:col-span-4 lg:col-span-3 h-60 rounded-md bg-right  md:bg-center' style={{ backgroundImage: `url(${ib})`, backgroundSize: "cover" }}></div>
                            <div className='md:col-span-4 lg:col-span-3 h-60 rounded-md bg-right  md:bg-center' style={{ backgroundImage: `url(${icse})`, backgroundSize: "cover" }}></div>
                            <div className='md:col-span-4 lg:col-span-2 h-60 rounded-md' style={{ backgroundImage: `url(${igcse})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>



                        </div>



                    </div>
                </div>

            </div>
        </div>
    )
}

export default Classes