import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading' // Loading স্পিনার ইমপোর্ট করা হলো
import axios from 'axios'
import { toast } from 'react-toastify'

const StudentsEnrolled = () => {

  // 🛠️ স্ক্রিনশট অনুযায়ী AppContext থেকে ভেরিয়েবল এবং ফাংশন নেওয়া হলো
  const { backendUrl, getToken, isEducator } = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState(null)

  // 🛠️ API কল করে ইনরোল হওয়া স্টুডেন্টদের ডাটা নিয়ে আসার ফাংশন
  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken()
      
      const { data } = await axios.get(
        backendUrl + '/api/educator/enrolled-students', 
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      )

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // 🛠️ ইউজার এডুকেটর হলে তবেই কেবল ডাটা ফেচ হবে
  useEffect(() => {
    if (isEducator) {
      fetchEnrolledStudents()
    }
  }, [isEducator])

  // 🛠️ ডাটা লোড হওয়ার সময় সুন্দর একটি Loading স্পিনার দেখাবে
  return enrolledStudents ? (
    <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 w-full overflow-y-scroll'>
      <div className='w-full'>
        <h2 className="pb-4 text-lg font-medium">Students Enrolled</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='table-fixed md:table-auto w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                <th className='px-4 py-3 font-semibold'>Student Name</th>
                <th className='px-4 py-3 font-semibold'>Course Title</th>
                <th className='px-4 py-3 font-semibold hidden sm:table-cell'>Date</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {enrolledStudents.map((item, index) => (
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                    <img 
                      src={item.student.imageUrl} 
                      alt="" 
                      className='w-9 h-9 rounded-full object-cover' 
                    />
                    <span className='truncate'>{item.student.name}</span>
                  </td>
                  <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                  <td className='px-4 py-3 hidden sm:table-cell'>
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading /> // 👈 null এর পরিবর্তে এখানে Loading কম্পোনেন্ট যুক্ত করা হয়েছে
}

export default StudentsEnrolled;