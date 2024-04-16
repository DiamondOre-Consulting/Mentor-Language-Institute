import React from 'react'
import Admindash from '../../Component/AdminComponents/Admindash'
import AdminSidebar from '../../Component/AdminComponents/AdminSidebar'


const Admin = () => {
  return (
    <>

     <AdminSidebar/>
      <div className="admin-content">
        <Admindash/>
      </div>

    </>
  )
}

export default Admin