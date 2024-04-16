import React from 'react'
import StudentNav from '../../Component/Studentcomponents/Studashboard/StudentNav'
import Studenthero from '../../Component/Studentcomponents/Studashboard/Studenthero'
import EnrolledCourses from '../../Component/Studentcomponents/Studashboard/EnrolledCourses'
import LanguageCourses from '../../Component/Studentcomponents/Studashboard/LanguageCourses'
import Classes from '../../Component/Studentcomponents/Studashboard/Classes'
import StuFooter from '../../Component/Studentcomponents/Studashboard/StuFooter'


const Maindash = () => {
  return (
    <>
        <StudentNav/>
        <Studenthero/>
        <EnrolledCourses/>
        <LanguageCourses/>
        <Classes/>
        <StuFooter/>
      
    
    </>
  )
}

export default Maindash