import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import axios from 'axios'
import { toast } from 'react-toastify'

const CourseDetails = () => {
  const { id } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)

  const { 
    allCourses, 
    calculateRating, 
    calculateNoOfLectures,
    calculateCourseDuration, 
    calculateChapterTime, 
    currency,
    fetchAllCourses,
    enrolledCourses,
    backendUrl,
    getToken,
    navigate
  } = useContext(AppContext)

  const fetchCourseData = async () => {
    if (allCourses && allCourses.length > 0) {
      const findCourse = allCourses.find(course => course._id === id)
      setCourseData(findCourse)
    }
  }

  useEffect(() => {
    if (fetchAllCourses) {
      fetchAllCourses();
    }
  }, [])

  useEffect(() => {
    fetchCourseData()
  }, [allCourses, id])

  useEffect(() => {
    if (enrolledCourses && enrolledCourses.length > 0 && courseData) {
      const isEnrolled = enrolledCourses.some(course => course._id === courseData._id)
      setIsAlreadyEnrolled(isEnrolled)
    }
  }, [enrolledCourses, courseData])

  const enrollCourse = async () => {
    try {
      if (isAlreadyEnrolled) {
        return navigate(`/player/${courseData._id}`)
      }

      const token = await getToken();
      if (!token) {
        return toast.warn('Please sign in to enroll in this course.')
      }

      toast.loading("Redirecting to Stripe payment gateway...")

      const { data } = await axios.post(
        backendUrl + '/api/user/purchase', 
        { courseId: courseData._id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.dismiss()

      if (data.success) {
        const { session_url } = data
        window.location.replace(session_url)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.dismiss()
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white text-left relative">
        <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
          <div className="absolute top-0 left-0 w-full h-[500px] -z-10 bg-gradient-to-b from-cyan-100/70"></div>

          {/* LEFT COLUMN */}
          <div className="max-w-xl z-10 text-gray-500">
            <div className="text-sm font-medium text-blue-600 flex items-center gap-1">
              <span>Home</span> <img src={assets.arrow_icon} alt="" className="w-2" /> 
              <span>Course List</span> <img src={assets.arrow_icon} alt="" className="w-2" /> 
              <span className="text-gray-700 truncate max-w-[200px]">{courseData?.courseTitle}</span>
            </div>

            <h1 className="text-course-deatails-heading-small md:text-course-deatails-heading-large font-semibold text-gray-800 mt-3 leading-tight">
              {courseData?.courseTitle}
            </h1>

            <p className="text-sm text-gray-600 mt-3" dangerouslySetInnerHTML={{__html: courseData?.courseDescription ? courseData.courseDescription.slice(0, 200) : ''}}></p>

            <div className="flex items-center gap-2 pt-4 text-sm font-medium">
              <p className="text-orange-500 font-bold">{calculateRating(courseData) ? calculateRating(courseData).toFixed(1) : '0.0'}</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={i < Math.floor(calculateRating(courseData) || 0) ? assets.star : assets.star_blank} alt="" className="w-3.5 h-3.5" />
                ))}
              </div>
              <p className="text-blue-600">({courseData?.courseRatings?.length || 0} {courseData?.courseRatings?.length > 1 ? 'ratings' : 'rating'})</p>
              <p className="text-gray-700">{courseData?.enrolledStudents?.length || 0} {courseData?.enrolledStudents?.length > 1 ? 'students' : 'student'}</p>
            </div>

            <p className="text-sm mt-3">Course by <span className="text-blue-600 underline cursor-pointer">GreatStack</span></p>

            {/* Course Structure */}
            <div className="pt-8 text-gray-800">
              <h2 className="text-xl font-semibold">Course Structure</h2>
              <p className="text-sm text-gray-500 pt-1">
                {courseData?.courseContent?.length || 0} sections • {calculateNoOfLectures(courseData)} lectures • {calculateCourseDuration(courseData)} total duration
              </p>

              <div className="pt-5">
                {courseData?.courseContent?.map((chapter, index) => {
                  // FIX: ডেটাবেজের 'courseContent' এবং স্ট্যান্ডার্ড 'chapterContent' দুটোই হ্যান্ডেল করার ব্যবস্থা
                  const lecturesList = chapter?.courseContent || chapter?.chapterContent || [];

                  return (
                    <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                      <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100/60 transition-all" onClick={() => toggleSection(index)}>
                        <div className="flex items-center gap-2">
                          <img src={assets.down_arrow_icon} alt="arrow" className={`w-3 transform transition-transform duration-200 ${openSections[index] ? 'rotate-180' : ''}`} />
                          <p className="font-semibold text-sm md:text-base text-gray-800">{chapter?.chapterTitle}</p>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{lecturesList.length} lectures • {calculateChapterTime(chapter)}</p>
                      </div>

                      <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                        {lecturesList.length > 0 ? (
                          <ul className="list-none md:pl-10 pl-4 pr-4 py-2 bg-white border-t border-gray-200 divide-y divide-gray-100">
                            {lecturesList.map((lecture, i) => (
                              <li key={i} className="flex items-center justify-between py-2.5 text-gray-700 text-sm">
                                <div className="flex items-center gap-2.5">
                                  <img src={assets.play_icon} alt="play" className="w-4 h-4 mt-0.5 opacity-80" />
                                  <p className="font-medium text-gray-800">{lecture?.lectureTitle}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  {lecture?.isPreviewFree && lecture?.lectureUrl && (
                                    <p 
                                      onClick={() => setPlayerData({ videoId: lecture.lectureUrl.split('/').pop() })} 
                                      className="text-blue-600 font-semibold cursor-pointer hover:underline text-xs bg-blue-50 px-2 py-0.5 rounded transition-all"
                                    >
                                      Preview
                                    </p>
                                  )}
                                  <p className="text-gray-500 font-medium text-xs">
                                    {humanizeDuration(((lecture?.lectureDuration || lecture?.duration || 0) * 60 * 1000), { units: ['h', 'm'], round: true })}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="p-4 text-xs text-gray-400 italic text-center bg-gray-50">
                            No lectures available in this section.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="py-20 text-sm md:text-default">
              <h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
              <div className="pt-3 rich-text text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: courseData?.courseDescription || '' }} />
            </div>
          </div>

          {/* RIGHT COLUMN (FLOATING CARD) */}
          <div className="z-10 max-w-course-card shadow-custom-card rounded bg-white overflow-hidden min-w-[300px] sm:min-w-[420px] border border-gray-200 sticky top-10">
            {playerData ? (
              <YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName="w-full aspect-video" />
            ) : (
              <div className="relative group">
                <img src={courseData?.courseThumbnail} alt="" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="bg-white/90 p-3 rounded-full shadow-md cursor-pointer">
                    <img src={assets.play_icon} alt="play" className="w-5 h-5 ml-0.5" />
                  </span>
                </div>
              </div>
            )}
            
            <div className="p-5">
              <div className="flex items-center gap-2">
                <img src={assets.time_left_clock_icon} alt="clock" className="w-3.5" />
                <p className="text-red-500 font-medium text-sm"><span className="font-bold">5 days</span> left at this price!</p>
              </div>

              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-bold text-gray-950">
                  {currency}{(courseData?.coursePrice - (courseData?.coursePrice * (courseData?.discount || 0) / 100)).toFixed(2)}
                </span>
                <span className="text-base line-through text-gray-400">{currency}{courseData?.coursePrice}</span>
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">{courseData?.discount}% off</span>
              </div>

              <button onClick={enrollCourse} className="w-full mt-5 bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition">
                {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
              </button>

              <div className="mt-6 space-y-3.5 text-sm text-gray-600 border-t border-gray-100 pt-5">
                <p className="text-gray-900 font-semibold">What's in the course?</p>
                <div className="flex items-center gap-3"><img src={assets.lesson_icon} alt="" className="w-4" /><p>Lifetime access with free updates</p></div>
                <div className="flex items-center gap-3"><img src={assets.time_clock_icon} alt="" className="w-4" /><p>Step-by-step, hands-on guidance</p></div>
                <div className="flex items-center gap-3"><img src={assets.blue_tick_icon} alt="" className="w-4" /><p>Downloadable resources & source code</p></div>
                <div className="flex items-center gap-3"><img src={assets.user_icon} alt="" className="w-4" /><p>Certificate of completion</p></div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}

export default CourseDetails