import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Rating from '../../components/student/Rating'

const Player = () => {

  const {
    enrolledCourses,
    calculateChapterTime,
    calculateNoOfLectures,
    calculateCourseDuration
  } = useContext(AppContext)

  const { courseId } = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)

  const getCourseData = () => {
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course)
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  useEffect(() => {
    getCourseData()
  }, [enrolledCourses])

  return (
    <div className='md:px-20 px-4 py-10 bg-gray-50 min-h-screen'>

      <div className='flex flex-col lg:flex-row gap-8'>

        {/* LEFT SECTION */}
        <div className='flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>

          <h2 className='text-2xl font-bold text-gray-900'>
            Course Structure
          </h2>

          {courseData && (
            <>
              <p className='text-sm text-gray-500 pt-2'>
                {courseData.courseContent.length} Sections •{' '}
                {calculateNoOfLectures(courseData)} Lectures •{' '}
                {calculateCourseDuration(courseData)} Total Duration
              </p>

              <div className='pt-6 space-y-3'>

                {courseData.courseContent.map((chapter, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 rounded-xl overflow-hidden'
                  >

                    {/* Header */}
                    <div
                      onClick={() => toggleSection(index)}
                      className='flex items-center justify-between px-4 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition'
                    >

                      <div className='flex items-center gap-3'>
                        <img
                          src={assets.down_arrow_icon}
                          alt=""
                          className={`w-3 transition-transform duration-300 ${
                            openSections[index] ? 'rotate-180' : ''
                          }`}
                        />
                        <p className='font-semibold text-gray-800 text-sm md:text-base'>
                          {chapter.chapterTitle}
                        </p>
                      </div>

                      <p className='text-xs md:text-sm text-gray-500'>
                        {chapter.chapterContent.length} lectures •{' '}
                        {calculateChapterTime(chapter)}
                      </p>

                    </div>

                    {/* Body */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openSections[index] ? 'max-h-[1000px]' : 'max-h-0'
                      }`}
                    >
                      <ul className='bg-white divide-y divide-gray-100'>

                        {chapter.chapterContent.map((lecture, i) => (
                          <li
                            key={i}
                            className='flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition'
                          >

                            <div className='flex items-center gap-3'>
                              <img
                                src={assets.play_icon}
                                alt=""
                                className='w-4 opacity-80'
                              />
                              <p className='text-sm text-gray-700 font-medium'>
                                {lecture.lectureTitle}
                              </p>
                            </div>

                            <div className='flex items-center gap-4'>

                              {lecture.lectureUrl && (
                                <button
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: i + 1,
                                    })
                                  }
                                  className='text-blue-600 text-xs font-semibold hover:underline'
                                >
                                  Watch
                                </button>
                              )}

                              <p className='text-xs text-gray-500'>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  { units: ['h', 'm'], round: true }
                                )}
                              </p>

                            </div>

                          </li>
                        ))}

                      </ul>
                    </div>

                  </div>
                ))}

              </div>
            </>
          )}

          <div className='flex items-center gap-2 py-3 mt-10'>
            <h2 className='text-xl font-bold'>Rate This Course</h2>
            <Rating initialRating={0}/>
          </div>

        </div>

        {/* RIGHT SECTION */}
        <div className='lg:w-[420px] w-full'>

          <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-24'>

            {playerData ? (

              <>
                <YouTube
                  videoId={playerData.lectureUrl.split('/').pop()}
                  iframeClassName='w-full aspect-video'
                />

                <div className='p-4'>

                  <p className='text-sm font-semibold text-gray-800'>
                    {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                  </p>

                  <button className='mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition'>
                    {false ? 'Completed' : 'Mark Completed'}
                  </button>

                </div>
              </>

            ) : (

              <div className='flex flex-col items-center justify-center p-6'>
                <img
                  src={courseData ? courseData.courseThumbnail : ''}
                  alt=""
                  className='rounded-lg'
                />
                <p className='text-gray-500 text-sm mt-3 text-center'>
                  Select a lecture to start learning
                </p>
              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default Player