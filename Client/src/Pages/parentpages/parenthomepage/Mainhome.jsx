import React from 'react'
import ParentNav from '../../../Component/Parentcomponent/parentHomeComponent/ParentNav'
import ParentHero from '../../../Component/Parentcomponent/parentHomeComponent/ParentHero'
import EnrolledCourse from '../../../Component/Parentcomponent/parentHomeComponent/EnrolledCourse'

const Mainhome = () => {
  return (
    <div>
        
        <ParentNav/>
        <ParentHero/>
        <EnrolledCourse/>
    </div>
  )
}

export default Mainhome