import React from 'react'
import ielts from '..//..//..//assets/ielts.jpg'
import sat from '..//..//..//assets/sat.jpg'
import toefl from '..//..//..//assets/toefl.jpg'
import ap from '..//..//..//assets/ap.jpg'
import english from '..//..//..//assets/english.webp'
import personality from '..//..//..//assets/persnality.webp'
import cuet from '..//..//..//assets/cuet1.jpg'

const SpecialCourses = () => {
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

                            <div className='grid grid-cols-1 md:grid-cols-5 gap-2 gap-y-4 mt-10 mb-0'>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${ielts})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${sat})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${toefl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${ap})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${cuet})`, backgroundSize: "contain", backgroundPosition: "center" ,backgroundRepeat:"no-repeat"}}></div>
                                <div className='border border-1 h-60 rounded-md' style={{ backgroundImage: `url(${english})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                                <div className='border border-1 h-60 rounded-md md:col-span-3' style={{ backgroundImage: `url(${personality})`, backgroundSize: "contain", backgroundPosition: "center" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SpecialCourses;
