import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from '../../components/student/CourseCard'

const CoursesList = () => {
  const navigate = useNavigate()
  const { allCourses } = useContext(AppContext) 
  const { input } = useParams()
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState(input || '')

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      if (input && input.trim() !== '') {
        const filtered = allCourses.filter(course => 
          course.courseTitle.toLowerCase().includes(input.toLowerCase())
        )
        setFilteredCourses(filtered)
      } else {
        setFilteredCourses(allCourses)
      }
    } else {
      setFilteredCourses([])
    }
  }, [input, allCourses])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/course-list/${searchQuery}`)
    } else {
      navigate('/course-list')
    }
  }

  return (
    <div className='px-8 md:px-36 pt-14 pb-20 text-left bg-[#FCFCFC] min-h-screen'>
      
      <div className='flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 w-full'>
        <div>
          <h1 className='text-3xl font-semibold text-[#1F2937]'>Course List</h1>
          <p className='text-sm mt-2 text-gray-500 font-normal'>
            <span className='text-blue-600 cursor-pointer hover:underline' onClick={() => navigate('/')}>Home</span> 
            <span className='text-gray-400 mx-2'>&gt;</span> 
            <span className='text-gray-700'>Course List</span>
          </p>
        </div>

        <form onSubmit={handleSearch} className='flex items-center bg-white border border-gray-300 rounded-md w-full max-w-md shadow-sm overflow-hidden'>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for courses..." 
            className='w-full px-4 py-3 text-sm bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none'
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(''); navigate('/course-list') }}
              className='text-gray-400 hover:text-gray-600 transition-colors px-2'
            >
              ×
            </button>
          )}
          <button type='submit' className='bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap rounded-r-md'>
            Search
          </button>
        </form>
      </div>

      {input && (
        <div className='flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-2 rounded-md w-fit mb-8 font-medium'>
          <span>{input}</span>
          <button 
            onClick={() => navigate('/course-list')} 
            className='hover:text-blue-900 font-bold ml-1 transition-colors'
          >
            ×
          </button>
        </div>
      )}

      {filteredCourses && filteredCourses.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8'>
          {filteredCourses.map((course) => (
            <div 
              key={course._id} 
              onClick={() => navigate(`/course/${course._id}`)} 
              className="cursor-pointer"
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-24 bg-white rounded-xl border border-dashed border-gray-300 max-w-4xl mx-auto shadow-sm mt-6'>
          <p className='text-gray-500 text-base font-medium'>No courses found matching your search.</p>
          <button 
            onClick={() => { setSearchQuery(''); navigate('/course-list') }} 
            className='mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2.5 rounded-md transition-colors font-medium shadow-sm'
          >
            See All Courses
          </button>
        </div>
      )}

    </div>
  )
}

export default CoursesList