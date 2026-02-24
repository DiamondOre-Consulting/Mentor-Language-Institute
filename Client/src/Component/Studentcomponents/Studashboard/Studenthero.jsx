import React, { useEffect, useState } from "react";
import studenthero from "..//..//..//assets/studenthero.png";
import translate from "translate"; // Import the translate package
import { Button } from "../../../components/ui/button";

const Studenthero = ({ naming }) => {
  const [index, setIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const languages = ["en", "hi", "ko", "ar", "fr", "es", "de", "it"]; // Array of language codes

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index) => (index + 1) % languages.length); // Cycle through languages array
    }, 3000);

    // Cleanup function to clear the interval
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const translateName = async () => {
      const studentName = naming?.name || "Student";
      const language = languages[index];

      try {
        const translatedWelcome = await translate("Welcome", {
          from: "en",
          to: language,
        });
        const translatedName = await translate(studentName, {
          from: "en",
          to: language,
        });
        setUserName(`${translatedWelcome} ${translatedName}`);
      } catch (error) {
        setUserName(`Welcome ${studentName}`);
      }
    };

    translateName();
  }, [index, naming]);

  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100/80 via-white to-amber-100/60 p-5 shadow-lg sm:p-8 md:mb-14">
      <div className="grid items-center gap-7 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="inline-flex w-fit items-center rounded-full border mb-2 border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-orange-700">
            Student Portal
          </span>
          {userName && (
            <h1 className="min-h-[3.25rem] text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:min-h-[4.5rem] sm:text-4xl lg:text-5xl">
              {userName}
            </h1>
          )}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Mentor Institute: your pathway to proficiency. Unlock fluency and broaden horizons with expert guidance and
            personalized support.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <a href="#courses">Explore Courses</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="#enrolledcourse">View Enrolled</a>
            </Button>
          </div>
        </div>

        <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-orange-300/20 blur-2xl" />
            <img src={studenthero} className="relative z-10 w-72 max-w-full" alt="Student dashboard hero" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Studenthero;

  
