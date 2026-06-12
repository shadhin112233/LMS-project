import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const { isEducator } = useContext(AppContext)
  const navigate = useNavigate() 
  const location = useLocation()
  
  const isCourseListPage = location.pathname.includes('/course-list')

  const { openSignIn } = useClerk()
  const { user } = useUser()

  return (
    <nav
      className={`flex items-center justify-between px-4 sm:px-8 md:px-14 lg:px-24 xl:px-36 py-4 border-b border-gray-200 ${
        isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'
      }`}
    >
      <Link to="/">
        <img
          src={assets.logo}
          alt="logo"
          className="w-24 sm:w-28 md:w-32 cursor-pointer"
        />
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-5 text-gray-600 font-medium">
        
        {isCourseListPage ? (
          <>
            {!user ? (
              <>
                <button onClick={() => navigate('/educator')} className="hover:text-blue-600 transition">
                  Add Courses
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={() => openSignIn()} className="hover:text-blue-600 transition">
                  Login
                </button>
                <button
                  onClick={() => openSignIn()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/educator')} className="hover:text-blue-600 transition">
                  {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                </button>
                <Link to="/my-enrollments" className="hover:text-blue-600 transition">
                  My Enrollments
                </Link>
                <UserButton />
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={() => navigate('/educator')} className="hover:text-blue-600 transition">
              {isEducator ? 'Educator Dashboard' : 'Become Educator'}
            </button>
            {user ? (
              <>
                <Link to="/my-enrollments" className="hover:text-blue-600 transition">
                  My Enrollments
                </Link>
                <UserButton />
              </>
            ) : (
              <button
                onClick={() => openSignIn()}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
              >
                Create Account
              </button>
            )}
          </>
        )}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-3">
        {isCourseListPage ? (
          <>
            {!user ? (
              <>
                <button onClick={() => navigate('/educator')} className="text-xs font-medium text-gray-600">
                  Add Courses
                </button>
                <button onClick={() => openSignIn()} className="text-xs font-medium text-gray-600">
                  Login
                </button>
                <button onClick={() => openSignIn()}>
                  <img src={assets.user_icon} alt="user" className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/educator')} className="text-xs font-medium text-gray-600">
                  {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                </button>
                <Link to="/my-enrollments" className="text-xs font-medium text-gray-600">
                  My Courses
                </Link>
                <UserButton />
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={() => navigate('/educator')} className="text-xs font-medium text-gray-600">
              {isEducator ? 'Educator Dashboard' : 'Become Educator'}
            </button>
            {user ? (
              <>
                <Link to="/my-enrollments" className="text-xs font-medium text-gray-600">
                  My Courses
                </Link>
                <UserButton />
              </>
            ) : (
              <button onClick={() => openSignIn()}>
                <img src={assets.user_icon} alt="user" className="w-6 h-6" />
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar