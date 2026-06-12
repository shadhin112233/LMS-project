import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets'; // আপনার প্রজেক্ট অনুযায়ী assets ইম্পোর্ট নিশ্চিত করুন

const Sidebar = () => {
  const { isEducator } = useContext(AppContext)

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: assets.home_icon },
    { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
    { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: assets.person_tick_icon },
  ];

  return isEducator && (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col'>
      {menuItems.map((item) => (
        <NavLink 
          to={item.path} 
          key={item.name}
          className={({ isActive }) => `flex items-center md:flex-row flex-col md:gap-3 gap-2 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-r-4 ${isActive ? 'text-indigo-600 bg-indigo-50 border-indigo-600' : 'border-transparent'}`}
        >
          <img src={item.icon} alt="" className="w-6 h-6" />
          <p className='md:block hidden text-center'>{item.name}</p>
        </NavLink>
      ))}
    </div>
  )
}

export default Sidebar