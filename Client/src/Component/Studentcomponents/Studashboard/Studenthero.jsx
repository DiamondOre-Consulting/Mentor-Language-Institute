import React, { useEffect, useState } from 'react'
import TextTransition, { presets } from 'react-text-transition';


const TEXTS = ['Welcome', 'Hola', 'Bonjour', 'こんにちは'];
const name="zoya";
const Studenthero = () => {


    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex((index) => index + 1);
        }, 3000); // Change the interval time as needed
        return () => clearInterval(intervalId);
    }, []);


    return (
        <>
            <section class="bg-white dark:bg-gray-900 mb-20">
                <div class="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
                    <div class="mr-auto place-self-center lg:col-span-7">
                        <h1 class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
                            <TextTransition springConfig={presets.wobbly}>
                                {TEXTS[index % TEXTS.length]}
                            </TextTransition>
                        </h1>

                        <p class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-md dark:text-gray-400">Mentor Language Institute: Your Pathway to Proficiency. Unlock fluency and broaden horizons with our expert guidance. Join us and embark on a journey of linguistic excellence</p>

                        <a href="#" class=" px-5 py-3 text-base font-medium text-center text-gray-900  bg-orange-500 text-white rounded-lg hover:bg-orange-500 focus:ring-4 hover:text-white focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                            Explore Courses
                        </a>
                    </div>


                    <div className="hidden  lg:mt-0 lg:col-span-5 lg:flex rounded-full relative">
                        <div id="bubble" className="bubble  absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-20 left-20 bg-orange-500 px-2 py-1 rounded-full">Dutch</div>
                        <div id="bubble2" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-40 left-1/2 bg-orange-500 px-2 py-1 rounded-full">Portuguese</div>
                        <div id="bubble3" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-10 left-3/4 bg-orange-500 px-2 py-1 rounded-full">Russian</div>
                        <div id="bubble4" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-40 left-3/4 bg-orange-500 px-2 py-1 rounded-full">Korean</div>
                        <div id="bubble4" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-20 left-1/2 bg-orange-500 px-2 py-1 rounded-full">Japanese</div>
                        <div id="bubble2" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-40 left-4/2 bg-orange-500 px-2 py-1 rounded-full">Chinese</div>
                        <div id="bubble3" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-0 left-1/3 bg-orange-500 px-2 py-1 rounded-full">Italian</div>
                        <div id="bubble4" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-60 left-40 bg-orange-500 px-2 py-1 rounded-full">Spanish</div>
                        <div id="bubble4" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-10 left-6/2 bg-orange-500 px-2 py-1 rounded-full">French</div>
                        <div id="bubble4" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-60 left-3/4 bg-orange-500 px-2 py-1 rounded-full">German</div>
                        <div id="bubble4" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-80 left-1/2 bg-orange-500 px-2 py-1 rounded-full">English</div>
                        <div id="bubble2" className="bubble absolute transform transition-transform hover:scale-110 hover:rotate-3 hover:z-10 text-gray-100 hover:shadow-lg cursor-pointer top-80 left-1/4 bg-orange-500 px-2 py-1 rounded-full">Hindi</div>
            

                    </div>

                </div>
            </section>
            <div className='h-1 w-64 mx-auto mt-24 bg-orange-500'></div>
        </>
    )
}

export default Studenthero