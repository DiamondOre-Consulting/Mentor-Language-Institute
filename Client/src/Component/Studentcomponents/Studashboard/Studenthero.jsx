import React, { useEffect, useState } from "react";
import TextTransition, { presets } from "react-text-transition";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import studenthero from '..//..//..//assets/studenthero.png'
import translate from 'translate'; // Import the translate package

const Studenthero = () => {
  const [index, setIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const languages = ['en', 'hi', 'ko', 'ar', 'fr', 'es', 'de', 'it']; // Array of language codes

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index) => (index + 1) % languages.length); // Cycle through languages array
    }, 3000);

    // Cleanup function to clear the interval
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch student data when the index (language) changes
    fetchStudentData();
  }, [index]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(
        "https://mentor-language-institute-backend-hbyk.onrender.com/api/students/my-profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const studentData = response.data;

        // Translate the "Welcome" text into the desired language
        const language = languages[index]; // Use the language at the current index
        const translatedWelcome = await translate("Welcome", { from: 'en', to: language });
        const translatedName = await translate(studentData.name, { from: 'en', to: language });

        setUserName(translatedWelcome + ' ' + translatedName);

      } else {
        // console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  return (
    <>
      <>
        <>
          <section className="bg-white md:mb-20 ">
            <div className="items-center px-5 md:px-4 py-8 mx-auto lg:grid lg:grid-cols-12 items-cetner">
              <div className="lg:col-span-7 md:col-span-7 md:mx-4 items-center ">
                {userName && (
                  <h1 className="mb-2 md:mb-4 text-3xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl ">
                    <TextTransition springConfig={presets.wobbly}>
                      {userName}
                    </TextTransition>
                  </h1>
                )}
                <p className="mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-md ">
                  Mentor Institute: Your Pathway to Proficiency. Unlock fluency and broaden horizons with our expert guidance. Join us and embark on a journey of linguistic excellence
                </p>
                <a href="#courses" className="px-5 py-3 text-base font-medium text-center text-gray-900 bg-orange-500 text-white rounded-lg hover:bg-orange-500 focus:ring-4 hover:text-white focus:ring-gray-100    ">
                  Explore Courses
                </a>
              </div>
              {/* Show the image on medium screens and larger */}
              <div className="lg:col-span-5 md:col-span-5 hidden md:flex justify-center flex">
                <img src={studenthero} className="w-64" alt="" />
              </div>
            </div>
          </section>
          <div className="h-1 w-64 mx-auto mt-10 md:mt-24 bg-orange-500"></div>
        </>

      </>



    </>
  );
};

export default Studenthero;
