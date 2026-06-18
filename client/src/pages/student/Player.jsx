import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import YouTube from 'react-youtube'
import Rating from '../../components/student/Rating'

const Player = () => {

  const {
    enrolledCourses,
    calculateChapterTime,
    calculateNoOfLectures,
    calculateCourseDuration,
    markLectureCompleted,
    submitCourseRating,
    userData
  } = useContext(AppContext)

  const { courseId } = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [userRating, setUserRating] = useState(0)

  const getCourseData = () => {
    if (enrolledCourses && enrolledCourses.length > 0) {
      const course = enrolledCourses.find((course) => course._id === courseId)
      if (course) {
        setCourseData(course)
        
        // প্রথম চ্যাপ্টারের লেকচার লিস্ট বের করা হচ্ছে
        const firstChapterLectures = course.courseContent?.[0]?.courseContent || course.courseContent?.[0]?.chapterContent;
        if (!playerData && firstChapterLectures?.[0]) {
          const firstLecture = firstChapterLectures[0];
          setPlayerData({
            ...firstLecture,
            videoUrl: firstLecture.lectureUrl || firstLecture.lectureVideo || firstLecture.videoUrl,
            chapter: 1,
            lecture: 1
          });
        }
      }
    }
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  useEffect(() => {
    getCourseData()
  }, [enrolledCourses, courseId])

  useEffect(() => {
    if (courseData && courseData.courseRatings && userData) {
      const existingRating = courseData.courseRatings.find(
        (r) => r.userId === userData._id || r.user === userData._id
      );
      if (existingRating) {
        setUserRating(existingRating.rating);
      }
    }
  }, [courseData, userData]);

  const getVideoId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  const isLectureCompleted = (lectureId) => {
    if (courseData && courseData.courseProgress) {
      return courseData.courseProgress.includes(lectureId);
    }
    if (courseData && courseData.lectureCompletedList) {
      return courseData.lectureCompletedList.includes(lectureId);
    }
    return false;
  }

  return (
    <div className='md:px-20 px-4 py-10 bg-gray-50 min-h-screen'>
      <div className='flex flex-col lg:flex-row gap-8'>

        {/* LEFT SECTION - Course Structure */}
        <div className='flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
          <h2 className='text-2xl font-bold text-gray-900'>Course Structure</h2>

          {courseData ? (
            <>
              <p className='text-sm text-gray-500 pt-2'>
                {courseData.courseContent ? courseData.courseContent.length : 0} Sections •{' '}
                {calculateNoOfLectures(courseData)} Lectures •{' '}
                {calculateCourseDuration(courseData)} Total Duration
              </p>

              <div className='pt-6 space-y-3'>
                {courseData.courseContent && courseData.courseContent.map((chapter, index) => {
                  const lecturesList = chapter.courseContent || chapter.chapterContent || [];

                  return (
                    <div key={index} className='border border-gray-200 rounded-xl overflow-hidden'>
                      
                      {/* Chapter Header */}
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
                        <p className='text-xs md:text-sm text-gray-500 font-medium'>
                          {lecturesList.length} lectures • {calculateChapterTime(chapter)}
                        </p>
                      </div>

                      {/* Chapter Body (Lectures) */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openSections[index] ? 'max-h-[1200px]' : 'max-h-0'
                        }`}
                      >
                        {lecturesList.length > 0 ? (
                          <ul className='bg-white divide-y divide-gray-200 border-t border-gray-100'>
                            {lecturesList.map((lecture, i) => {
                              const currentId = lecture._id || lecture.lectureId;
                              const completed = isLectureCompleted(currentId);
                              const videoLink = lecture.lectureUrl || lecture.lectureVideo || lecture.videoUrl;

                              return (
                                <li key={i} className='flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/80 transition'>
                                  <div className='flex items-center gap-3'>
                                    <img
                                      src={completed ? assets.blue_tick_icon : assets.play_icon}
                                      alt=""
                                      className='w-4 h-4 object-contain'
                                    />
                                    <p className='text-sm text-gray-700 font-medium'>
                                      {lecture.lectureTitle}
                                    </p>
                                  </div>

                                  <div className='flex items-center gap-4'>
                                    {videoLink && (
                                      <button
                                        onClick={() =>
                                          setPlayerData({
                                            ...lecture,
                                            videoUrl: videoLink,
                                            chapter: index + 1,
                                            lecture: i + 1,
                                          })
                                        }
                                        className='text-blue-600 text-xs font-bold hover:underline bg-blue-50 px-2.5 py-1 rounded transition-all'
                                      >
                                        Watch
                                      </button>
                                    )}

                                    <p className='text-xs text-gray-500 font-medium'>
                                      {lecture.lectureDuration || lecture.duration || 0}m
                                    </p>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className='p-4 text-xs text-gray-400 italic text-center bg-gray-50'>
                            No lectures available in this section.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className='text-gray-500 text-sm mt-4'>Loading course structure...</p>
          )}

          {/* Rate Course */}
          <div className='flex items-center gap-2 py-3 mt-10 border-t border-gray-100 pt-6'>
            <h2 className='text-xl font-bold text-gray-800'>Rate This Course</h2>
            {submitCourseRating ? (
              <Rating 
                initialRating={userRating} 
                onRate={(ratingValue) => submitCourseRating(courseId, ratingValue)}
              />
            ) : (
              <Rating initialRating={userRating} />
            )}
          </div>
        </div>

        {/* RIGHT SECTION - Video Window */}
        <div className='lg:w-[420px] w-full'>
          <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-24'>
            {playerData && playerData.videoUrl ? (
              <>
                {getVideoId(playerData.videoUrl) ? (
                  <YouTube
                    videoId={getVideoId(playerData.videoUrl)}
                    opts={{ playerVars: { autoplay: 1 } }}
                    iframeClassName='w-full aspect-video'
                  />
                ) : (
                  <video 
                    src={playerData.videoUrl} 
                    controls 
                    autoPlay 
                    className='w-full aspect-video bg-black'
                  />
                )}
                
                <div className='p-4'>
                  <p className='text-sm font-semibold text-gray-800 leading-relaxed'>
                    {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                  </p>

                  {isLectureCompleted(playerData._id || playerData.lectureId) ? (
                    <button 
                      disabled
                      className='mt-4 w-full bg-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-lg cursor-not-allowed shadow-sm'
                    >
                      Completed
                    </button>
                  ) : (
                    <button 
                      onClick={() => markLectureCompleted && markLectureCompleted(courseId, playerData._id || playerData.lectureId)}
                      className='mt-4 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg transition shadow-sm'
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className='flex flex-col items-center justify-center p-6 bg-gray-50/50'>
                <img
                  src={courseData ? courseData.courseThumbnail : ''}
                  alt=""
                  className='rounded-xl w-full object-cover aspect-video shadow-sm'
                />
                <p className='text-gray-500 text-sm mt-4 text-center font-medium'>
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