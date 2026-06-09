import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const CourseCard = ({ course }) => {

  const { currency, calculateRating } = useContext(AppContext)
  
  // বারবার ফাংশন কল না করে একবার রেটিং বের করে নেওয়া ভালো কর্মক্ষমতার জন্য
  const averageRating = calculateRating(course);
  const totalReviews = course?.courseRating?.length || 0;

  return (
    <div className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg shadow-sm bg-white'>
      <img className='w-full' src={course.courseThumbnail} alt="" />
      <div className='p-5'>
        <h3 className='text-base font-semibold text-gray-800'>{course.courseTitle}</h3>
        <p className='text-sm text-gray-500 mt-1'>{course.educator?.name || 'Unknown Educator'}</p>
        <div className='flex items-center space-x-2 mt-2'>
          <p className='text-sm font-semibold text-yellow-500'>{averageRating}</p>
          <div className='flex space-x-1'>
            {[...Array(5)].map((_, i) => (
              <img 
                key={i} 
                className='w-3.5 h-3.5' 
                src={i < Math.floor(averageRating) ? assets.star : assets.star_blank} 
                alt='' 
              />
            ))}
          </div>
          <p className='text-sm text-gray-400'>({totalReviews})</p>
        </div>
        <p className='text-base font-semibold text-gray-800 mt-3'>
          {currency}{(course.coursePrice - (course.discount * course.coursePrice) / 100).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export default CourseCard