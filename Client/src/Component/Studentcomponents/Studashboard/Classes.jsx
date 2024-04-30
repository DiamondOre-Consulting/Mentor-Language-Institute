import React from 'react'

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

                        <div className='grid grid-cols-1 md:grid-cols-5 gap-2 gap-y-4 mt-10 mb-10'>

                        <div className='col-span-2 h-60 rounded-md' style={{ backgroundImage: "url('https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2023/08/cbse-2-1691847358.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                        <div className='col-span-3 h-60 rounded-md' style={{ backgroundImage: "url('https://www.genesisglobalschool.edu.in/wp-content/uploads/2022/03/NormalPosts602560883-1.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                        <div className='col-span-3 h-60 rounded-md' style={{ backgroundImage: "url('https://cdn1.byjus.com/wp-content/uploads/2018/11/icse/2015/12/15074328/icse.png')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                        <div className='col-span-2 h-60 rounded-md' style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/IGCSE_cover.jpg/640px-IGCSE_cover.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                           
                          

                        </div>


                        
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Classes