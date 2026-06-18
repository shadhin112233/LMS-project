import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Loading from '../../components/student/Loading' // Loading স্পিনার ইমপোর্ট করা হলো
import axios from 'axios'
import { toast } from 'react-toastify'

const Dashboard = () => {

  // 🛠️ স্ক্রিনশট অনুযায়ী AppContext থেকে ভেরিয়েবল এবং ফাংশন নেওয়া হলো
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)

  // 🛠️ API এর মাধ্যমে এডুকেটর ড্যাশবোর্ডের রিয়েল ডাটা ফেচ করার ফাংশন
  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      
      const { data } = await axios.get(
        backendUrl + '/api/educator/dashboard', 
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      )

      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // 🛠️ ইউজার যদি এডুকেটর হয়, তবেই কেবল ড্যাশবোর্ড ডাটা লোড হবে
  useEffect(() => {
    if (isEducator) {
      fetchDashboardData()
    }
  }, [isEducator])

  // 🛠️ ডাটা লোড হওয়ার সময় সুন্দর একটি Loading স্পিনার দেখাবে
  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0 w-full overflow-y-scroll'>
      <div className='space-y-5 w-full'>
        <div className='flex flex-wrap gap-5 items-center'>

          {/* Card 1: Total Enrolments */}
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md bg-white'>
            <img src={assets.patients_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {dashboardData.enrolledStudentsData?.length || 0}
              </p>
              <p className='text-base text-gray-500'>Total Enrolments</p>
            </div>
          </div>

          {/* Card 2: Total Courses */}
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md bg-white'>
            <img src={assets.appointments_icon} alt="appointments_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {dashboardData.totalCourses || 0}
              </p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>

          {/* Card 3: Total Earnings */}
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md bg-white'>
            <img src={assets.earning_icon || assets.patients_icon} alt="earning_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {currency}{dashboardData.totalEarnings || 0}
              </p>
              <p className='text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>

        </div>

        {/* Latest Enrolments Table Section */}
        <div className='pt-4 w-full'>
          <h2 className="pb-4 text-lg font-medium">Latest Enrolments</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {dashboardData.enrolledStudentsData && dashboardData.enrolledStudentsData.length > 0 ? (
                  dashboardData.enrolledStudentsData.slice(0, 5).map((item, index) => ( // টিউটোরিয়াল অনুযায়ী লেটেস্ট ৫টি ডাটা স্লাইস করে দেখানো হলো
                    <tr key={index} className="border-b border-gray-500/20">
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {index + 1}
                      </td>
                      <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                        <img 
                          src={item.student?.imageUrl || "https://via.placeholder.com/150"} 
                          alt="Profile" 
                          className="w-9 h-9 rounded-full object-cover" 
                        />
                        <span className="truncate">{item.student?.name || "Unknown"}</span>
                      </td>
                      <td className="px-4 py-3 truncate">
                        {item.courseTitle}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-400">
                      No enrolments found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  ) : <Loading /> // 👈 null এর পরিবর্তে এখানে সুন্দর Loading স্পিনার অ্যাড করা হয়েছে
}

export default Dashboard;