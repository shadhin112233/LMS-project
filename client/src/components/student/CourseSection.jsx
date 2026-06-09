import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'

const CoursesSection = () => {

  const { allCourses } = useContext(AppContext)

  return (
    <div className='py-16 md:px-40 px-8 text-center'>
      <h2 className='text-3xl font-medium text-gray-800'>Learn from the best</h2>
      <p className='text-sm md:text-base text-gray-500 mt-3 max-w-xl mx-auto'>
        Discover our top-rated courses across various categories. From coding and design to business and wellness, our courses are crafted to deliver results.
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-10 text-left'>
        {allCourses.slice(0, 4).map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>

      <Link 
        to={'/course-list'} 
        onClick={() => scrollTo(0, 0)}
        className='inline-block mt-8 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-10 py-3 rounded transition-colors duration-200'
      >
        Show all courses
      </Link>
    </div>
  )
}

export default CoursesSection