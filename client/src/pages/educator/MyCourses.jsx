import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyCourses = () => {

  // 🛠️ স্ক্রিনশট অনুযায়ী Context থেকে প্রয়োজনীয় ফাংশন ও ভেরিয়েবল নেওয়া হলো
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)
  const [courses, setCourses] = useState(null)

  // 🛠️ API এর মাধ্যমে এডুকেটরের নিজস্ব কোর্সগুলো ব্যাকএন্ড থেকে ফেচ করার ফাংশন
  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken()
      
      const { data } = await axios.get(
        backendUrl + '/api/educator/courses', 
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      )

      if (data.success) {
        setCourses(data.courses)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // 🛠️ ইউজার যদি এডুকেটর হয়, তবেই কেবল ডাটা লোড হবে
  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses()
    }
  }, [isEducator])

  return courses ? (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 w-full overflow-y-scroll'>
      <div className='w-full'>
        <h2 className="pb-4 text-lg font-medium">My Courses</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='table-fixed md:table-auto w-full overflow-hidden'>
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">Published On</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {courses.map((course) => (
                <tr key={course._id} className="border-b border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <img 
                      src={course.courseThumbnail} 
                      alt="Course Image" 
                      className="w-16 h-10 object-cover rounded" 
                    />
                    <span className="truncate hidden md:block">{course.courseTitle}</span>
                  </td>
                  <td className="px-4 py-3">
                    {currency} {Math.floor(
                      (course.enrolledStudents?.length || 0) * (course.coursePrice - (course.discount * course.coursePrice / 100))
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {course.enrolledStudents?.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default MyCourses;