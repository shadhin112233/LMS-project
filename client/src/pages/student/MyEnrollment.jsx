import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'

import { Line } from 'rc-progress'

const MyEnrollments = () => {

  const { enrolledCourses, calculateCourseDuration, navigate } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 1, totalLectures: 5 },
    { lectureCompleted: 3, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 3 },
    { lectureCompleted: 5, totalLectures: 7 },
    { lectureCompleted: 6, totalLectures: 8 },
    { lectureCompleted: 2, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 10 },
    { lectureCompleted: 3, totalLectures: 5 },
    { lectureCompleted: 7, totalLectures: 7 },
    { lectureCompleted: 1, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 2 },
    { lectureCompleted: 5, totalLectures: 5 },
  ])

  return (
    <div className='md:px-36 px-8 pt-10'>
      <h1 className='text-2xl font-semibold'>My Enrollments</h1>

      <table className='table-auto table-fixed w-full overflow-hidden border mt-10'>
        <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
          <tr>
            <th className='px-4 py-3 font-semibold truncate'>Course</th>
            <th className='px-4 py-3 font-semibold truncate'>Duration</th>
            <th className='px-4 py-3 font-semibold truncate'>Completed</th>
            <th className='px-4 py-3 font-semibold truncate'>Status</th>
          </tr>
        </thead>

        <tbody className='text-sm text-gray-700'>
          {enrolledCourses.map((course, index) => (
            <tr key={index} className='border-b border-gray-500/20'>

              {/* Course Thumbnail & Title */}
              <td className='px-4 py-3 flex items-center space-x-3'>
                <img
                  src={course.courseThumbnail}
                  alt=""
                  className='w-14 sm:w-24 md:w-28 rounded'
                />

                <div className='flex-1'>
                  <p className='font-medium text-base max-sm:text-sm'>
                    {course.courseTitle}
                  </p>

                  <Line
                    strokeWidth={6}
                    trailWidth={6}
                    strokeColor="#2563eb"
                    percent={
                      progressArray[index]
                        ? (progressArray[index].lectureCompleted * 100) /
                          progressArray[index].totalLectures
                        : 0
                    }
                    className='bg-gray-300 rounded-full mt-2'
                  />
                </div>
              </td>

              {/* Course Duration */}
              <td className='px-4 py-3'>
                {calculateCourseDuration(course)}
              </td>

              {/* Lectures Count */}
              <td className='px-4 py-3'>
                {progressArray[index] &&
                  `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures}`}
                <span> Lectures</span>
              </td>

              {/* Status Button */}
              <td className='px-4 py-3'>
                <button
                  onClick={() => navigate('/player/' + course._id)}
                  className='px-3 py-1.5 bg-blue-600 text-white rounded text-xs'
                >
                  {progressArray[index] &&
                  progressArray[index].lectureCompleted /
                    progressArray[index].totalLectures === 1
                    ? 'Completed'
                    : 'On Going'}
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MyEnrollments