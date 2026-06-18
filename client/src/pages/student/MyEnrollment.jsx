import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress'

const MyEnrollments = () => {

  const { enrolledCourses, calculateCourseDuration, navigate, fetchUserEnrolledCourses } = useContext(AppContext);

  useEffect(() => {
    if (fetchUserEnrolledCourses) {
      fetchUserEnrolledCourses();
    }
  }, [])

  return (
    <div className='md:px-36 px-8 pt-10 min-h-[75vh]'>
      <h1 className='text-2xl font-semibold text-gray-800'>My Enrollments</h1>

      <table className='table-auto table-fixed w-full overflow-hidden border border-gray-200 rounded-lg mt-10 bg-white shadow-sm'>
        <thead className='text-gray-900 border-b border-gray-200 text-sm text-left max-sm:hidden bg-gray-50'>
          <tr>
            <th className='px-4 py-3 font-semibold truncate'>Course</th>
            <th className='px-4 py-3 font-semibold truncate'>Duration</th>
            <th className='px-4 py-3 font-semibold truncate'>Completed</th>
            <th className='px-4 py-3 font-semibold truncate'>Status</th>
          </tr>
        </thead>

        <tbody className='text-sm text-gray-700 divide-y divide-gray-100'>
          {enrolledCourses.map((course, index) => {
            // প্রোগ্রেস পার্সেন্টেজ সেফ ক্যালকুলেশন
            const completedCount = course.lectureCompleted || 0;
            const totalCount = course.totalLectures || 1; 
            const progressPercent = Math.min(Math.round((completedCount * 100) / totalCount), 100);

            return (
              <tr key={index} className='hover:bg-gray-50/50 transition'>

                {/* Course Thumbnail & Title */}
                <td className='px-4 py-4 flex items-center space-x-3'>
                  <img
                    src={course.courseThumbnail}
                    alt=""
                    className='w-14 sm:w-24 md:w-28 rounded object-cover aspect-video shadow-sm'
                  />

                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-gray-900 text-base max-sm:text-sm truncate'>
                      {course.courseTitle}
                    </p>

                    <Line
                      strokeWidth={4}
                      trailWidth={4}
                      strokeColor="#2563eb"
                      trailColor="#e5e7eb"
                      percent={progressPercent}
                      className='rounded-full mt-2 transition-all duration-500'
                    />
                  </div>
                </td>

                {/* Course Duration */}
                <td className='px-4 py-4 max-sm:hidden font-medium text-gray-600'>
                  {calculateCourseDuration(course)}
                </td>

                {/* Lectures Count */}
                <td className='px-4 py-4 max-sm:hidden text-gray-600 font-medium'>
                  {`${completedCount}/${totalCount}`}
                  <span className='text-gray-400 font-normal'> Lectures</span>
                </td>

                {/* Status Button */}
                <td className='px-4 py-4'>
                  <button
                    onClick={() => navigate('/player/' + course._id)}
                    className={`px-4 py-1.5 rounded text-xs font-semibold shadow-sm transition-all ${
                      progressPercent === 100 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {progressPercent === 100 ? 'Completed' : 'On Going'}
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}

export default MyEnrollments