import React, { useState } from 'react'
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import hindi from '../../../assets/hindi.png'
import dutch from '../../../assets/dutch.png'
import english from '../../../assets/english.png'
import chinese from '../../../assets/chinese.png'
import french from '../../../assets/french.png'
import german from '../../../assets/german.png'
import italian from '../../../assets/italian.png'
import japanese from '../../../assets/japanese.png'
import korean from '../../../assets/korean.png'
import portugese from '../../../assets/portugese.png'
import russian from '../../../assets/russian.png'
import sanskrit from '../../../assets/sanskrit.png'
import spanish from '../../../assets/spanish.png'



const LanguageCourses = () => {

    const [showPopup, setShowPopup] = useState(false);
    const [showPopupEnroll, setShowPopupEnroll] = useState(false);


    const handleClose = () => {
        setShowPopup(false);
        setShowPopupEnroll(true)
    };

    const handleEnrollClose = () =>{
        
        setShowPopupEnroll(false)
    }

    const settings = {
        centerMode: true,
        centerPadding: '60px',
        slidesToShow: 5,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }
        ]
    };

    return (
        <>
            <div className='px-10 '>
                <h1 className='text-4xl font-bold mb-24 text-gray-900'>Language Courses</h1>

                <div className='slider-container PY-10'>
                    <Slider {...settings}>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={hindi} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={dutch} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={english} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={chinese} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={french} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={german} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={italian} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={japanese} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={korean} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={portugese} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={russian} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={sanskrit} alt="" onClick={() => setShowPopup(true)} /></div>
                        <div className='w-full '><img className='w-2/3 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl cursor-pointer' src={spanish} alt="" onClick={() => setShowPopup(true)} /></div>
                    </Slider>

                    {showPopup && (
                        <div className="fixed inset-0 flex items-center justify-center">

                            <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/3  grid grid-cols-2">
                                <img src="https://t4.ftcdn.net/jpg/06/23/40/73/360_F_623407391_wtq6RVJUq2RGb2e3D0ykn5zJOqfJhOSc.jpg" className='h-full' alt="" />
                                <div className="p-6 text-left">
                                    <h2 className="text-xl font-bold text-teal-green-900 mb-4">Hindi</h2>
                                    <p className="text-sm text-gray-600 ">Teacher name :-  <span>John</span></p>
                                    <p className="text-sm text-gray-600 ">Schedule :-  <span>M/W/F</span></p>
                                    <p className="text-sm text-gray-600 mb-6">Dusration :- <span>42hrs</span></p>
                                    <button
                                        className="block w-full px-4 py-2 bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none "
                                        onClick={handleClose}
                                    >
                                        Enrolled Now
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {showPopupEnroll && (
                        <div className="fixed inset-0 flex items-center justify-center">

                            <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/3">
                               
                                <div className="p-6 text-left">
                                    <h2 className="text-xl font-bold text-teal-green-900 mb-4">Thankyou For Enrolling!!</h2>
                                    <p className="text-sm text-gray-600 mb-6">We Will connect you soon</p>
                                    <button
                                        className="block w-full px-4 py-2 bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none "
                                        onClick={handleEnrollClose}
                                    >
                                        close
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}


                    <style jsx global>{`
    .slick-prev,
    .slick-next {
        width: 50px;
        height: 50px;
        background-color: rgb(249 115 22);;
        border: 1px solid rgb(249 115 22);;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0px;
        cursor: pointer;
        z-index: 1; /* Ensure the buttons are above the slider */
    }

    .slick-prev:hover,
    .slick-next:hover {
        background-color: rgb(249 115 22);; /* Darken the background color on hover */
    }

    .slick-prev {
        left: 10px;
    }

    .slick-next {
        right: 10px;
    }
    
`}</style>



                </div>

            </div>
        </>
    )
}

export default LanguageCourses