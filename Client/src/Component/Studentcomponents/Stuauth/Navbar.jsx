import React from 'react'
import logo from '..//..//..//assets/logo.png'

const Navbar = () => {
  return (
    <>
        <div className='flex justify-between items-center pt-4 px-10'>
            <img src={logo} alt="" className='w-32'/>
            <select>
                <option>Help?</option>
                <option>+918458495</option>
            </select>

        </div>
    </>
  )
}

export default Navbar