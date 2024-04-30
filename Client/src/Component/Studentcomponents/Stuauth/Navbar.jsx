import React from 'react'
import logo from '..//..//..//assets/logo.png'

const Navbar = () => {
  return (
    <>
        <div className='flex justify-between items-center pt-4 px-10'>
            <img src={logo} alt="" className='w-32'/>
            <select className='w-28'>
                <option>Help?</option>
                <option>+91-9999466159</option>
                <option className='text-wrap '>mentor.languageclasses@gmail.com</option>
            </select>

        </div>
    </>
  )
}

export default Navbar