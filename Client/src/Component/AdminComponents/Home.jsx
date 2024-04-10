import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
    return (
        <>
        <h1 className='text-3xl font-semibold mb-10 text-gray-600'>Welcome !! <br></br><span className='text-orange-500 font-bold'>Admin</span></h1>
            <div className='grid grid-cols-3 gap-4'>
                <Link to={'/all-parents'} class='border border-1 flex items-center justify-center h-96  bg-gradient-to-br'>
                    <div
                        class="overflow-hidden  aspect-video bg-red-400 cursor-pointer rounded-xl relative group"
                    >
                        <div
                            class="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute from-black/80 to-transparent bg-gradient-to-t inset-x-0 -bottom-2 pt-30 text-white flex items-end"
                        >
                            <div>
                                <div
                                    class="transform-gpu  p-4 space-y-3 text-xl group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 pb-10 transform transition duration-300 ease-in-out"
                                >
                                    <div class="font-bold">Parents</div>
                                </div>
                            </div>
                        </div>
                        <img
                            alt=""
                            class="object-cover w-full h-full group-hover:scale-110 transition duration-300 ease-in-out"
                            src="https://media.istockphoto.com/id/1028429904/photo/smiling-family-on-sofa-stock-image.jpg?s=612x612&w=0&k=20&c=PFdl0OIBOuBtLEi7QmzRZuMacVkfH0nsJpbBudothyE="
                        />
                    </div>
                </Link>

                <div class='border border-1 flex items-center justify-center h-96  bg-gradient-to-br'>
                    <div
                        class="overflow-hidden  aspect-video bg-red-400 cursor-pointer rounded-xl relative group"
                    >
                        <div
                            class="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute from-black/80 to-transparent bg-gradient-to-t inset-x-0 -bottom-2 pt-30 text-white flex items-end"
                        >
                            <div>
                                <div
                                    class="transform-gpu  p-4 space-y-3 text-xl group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 pb-10 transform transition duration-300 ease-in-out"
                                >
                                    <div class="font-bold">Students</div>
                                </div>
                            </div>
                        </div>
                        <img
                            alt=""
                            class="object-cover w-full h-full group-hover:scale-110 transition duration-300 ease-in-out"
                            src="https://morweb.org/get/files/image/galleries/college_websites_feature.jpg"
                        />
                    </div>
                </div>

                <div class='border border-1 flex items-center justify-center h-96  bg-gradient-to-br'>
                    <div
                        class="overflow-hidden  aspect-video bg-red-400 cursor-pointer rounded-xl relative group"
                    >
                        <div
                            class="rounded-xl z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out cursor-pointer absolute from-black/80 to-transparent bg-gradient-to-t inset-x-0 -bottom-2 pt-30 text-white flex items-end"
                        >
                            <div>
                                <div
                                    class="transform-gpu  p-4 space-y-3 text-xl group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 pb-10 transform transition duration-300 ease-in-out"
                                >
                                    <div class="font-bold">Teachers</div>
                                </div>
                            </div>
                        </div>
                        <img
                            alt=""
                            class="object-cover w-full h-full group-hover:scale-110 transition duration-300 ease-in-out"
                            src="https://cdn.create.vista.com/api/media/small/229020392/stock-photo-beautiful-female-teacher-formal-wear-glasses-holding-notebook-classroom"
                        />
                    </div>
                </div>

            </div>
        </>
    )
}

export default Home