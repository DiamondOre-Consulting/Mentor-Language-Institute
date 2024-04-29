import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import TeacherHome from './TeacherHome';

const TeachersClasses = () => {
    
    const [showPopupCourses, setShowPopupCourses] = useState(false);
    const [showScheduleClass , setShowScheduleClass] =  useState(false);

    const handleCloseCourses = () => {
        setShowPopupCourses(false);
    };

    return (
        <>
         
        </>
    )
}

export default TeachersClasses