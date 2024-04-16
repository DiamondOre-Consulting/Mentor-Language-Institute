import React from 'react'
import TeacherSidebar from '../../Component/TeachersComponents/TeacherSidebar'
import TeacherDashboard from '../../Component/TeachersComponents/TeacherDashboard'

const Teachermain = () => {
  return (
    <>
       <TeacherSidebar/>
      <div className="admin-content">
        <TeacherDashboard/>
      </div>
    </>
  )
}

export default Teachermain