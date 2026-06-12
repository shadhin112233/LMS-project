import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../../assets/assets'
import Quill from 'quill'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddCourse = () => {

  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(false)
  const [chapters, setChapters] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [currentChapterId, setCurrentChapterId] = useState(null)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false
  })

  // Handle Chapter Operations (Add, Toggle, Remove)
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:')
      if (title) {
        const newChapter = {
          chapterId: Date.now().toString(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false
        }
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'toggle') {
      setChapters(chapters.map(chapter => 
        chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
      ))
    } else if (action === 'remove') {
      setChapters(chapters.filter(chapter => chapter.chapterId !== chapterId))
    }
  }

  // Handle Lecture Operations (Add, Remove)
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId)
      setShowPopup(true)
    } else if (action === 'remove') {
      setChapters(chapters.map(chapter => {
        if (chapter.chapterId === chapterId) {
          return {
            ...chapter,
            chapterContent: chapter.chapterContent.filter((_, index) => index !== lectureIndex)
          }
        }
        return chapter
      }))
    }
  }

  // Add Lecture From Popup
  const addLecture = () => {
    setChapters(chapters.map(chapter => {
      if (chapter.chapterId === currentChapterId) {
        return {
          ...chapter,
          chapterContent: [...chapter.chapterContent, lectureDetails]
        }
      }
      return chapter
    }))
    setShowPopup(false)
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false
    })
  }

  // Handle Form Submission with API & Cloudinary Logic
  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      
      if (!image) {
        return toast.error('Please select a course thumbnail')
      }

      const courseDescription = quillRef.current ? quillRef.current.root.innerHTML : ''

      const formData = new FormData()
      formData.append('courseTitle', courseTitle)
      formData.append('courseDescription', courseDescription)
      formData.append('coursePrice', coursePrice)
      formData.append('discount', discount)
      formData.append('courseThumbnail', image)
      formData.append('chapters', JSON.stringify(chapters))

      // API backend integration
      const { data } = await axios.post('/api/educator/add-course', formData)

      if (data.success) {
        toast.success(data.message)
        setCourseTitle('')
        setCoursePrice(0)
        setDiscount(0)
        setImage(false)
        setChapters([])
        if (quillRef.current) {
          quillRef.current.root.innerHTML = ''
        }
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  // Initialize Quill Editor
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      })
    }
  }, [])

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 text-gray-500 w-full max-w-md'>
        
        {/* Course Title */}
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input 
            onChange={e => setCourseTitle(e.target.value)} 
            value={courseTitle} 
            type="text" 
            placeholder='Type here' 
            className='outline-none border border-gray-500 p-2.5 rounded' 
            required 
          />
        </div>

        {/* Course Description */}
        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef} className='bg-white'></div>
        </div>

        {/* Price & Discount & Thumbnail Row */}
        <div className='flex items-center justify-between gap-4 flex-wrap'>
          <div className='flex flex-col gap-1 w-32'>
            <p>Course Price</p>
            <input 
              onChange={e => setCoursePrice(e.target.value)} 
              value={coursePrice} 
              type="number" 
              placeholder='0' 
              className='outline-none border border-gray-500 p-2.5 rounded' 
              required 
            />
          </div>

          {/* Thumbnail Upload */}
          <div className='flex flex-col gap-2'>
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnail" className='flex items-center gap-3 cursor-pointer'>
              <img 
                src={image ? URL.createObjectURL(image) : assets.file_upload_icon} 
                alt="" 
                className='p-3 border border-gray-500 rounded w-24 h-24 object-cover' 
              />
              <input 
                type="file" 
                id='thumbnail' 
                onChange={e => setImage(e.target.files[0])} 
                accept='image/*' 
                hidden 
              />
            </label>
          </div>

          <div className='flex flex-col gap-1 w-32'>
            <p>Discount %</p>
            <input 
              onChange={e => setDiscount(e.target.value)} 
              value={discount} 
              type="number" 
              placeholder='0' 
              className='outline-none border border-gray-500 p-2.5 rounded' 
              required 
            />
          </div>
        </div>

        {/* Curriculum Section */}
        <div className='flex flex-col gap-4'>
          <p>Course Curriculum</p>
          
          <div className='space-y-4 bg-white p-4 border border-gray-500/30 rounded'>
            {chapters.map((chapter, chapterIndex) => (
              <div key={chapter.chapterId} className='border border-gray-500/30 bg-gray-50 rounded'>
                
                {/* Chapter Header */}
                <div 
                  className='flex items-center justify-between px-4 py-3 border-b border-gray-500/30 cursor-pointer select-none' 
                  onClick={() => handleChapter('toggle', chapter.chapterId)}
                >
                  <div className='flex items-center gap-2'>
                    <img 
                      src={assets.dropdown_icon} 
                      alt="" 
                      className={`w-2.5 transition-all duration-200 ${chapter.collapsed ? '-rotate-90' : ''}`} 
                    />
                    <span className='font-semibold text-gray-800'>{chapterIndex + 1} {chapter.chapterTitle}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-gray-500 text-xs'>{chapter.chapterContent.length} lectures</span>
                    <img 
                      src={assets.cross_icon} 
                      alt="Remove Chapter" 
                      className='w-2.5 cursor-pointer' 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleChapter('remove', chapter.chapterId) 
                      }} 
                    />
                  </div>
                </div>

                {/* Chapter Lectures Content */}
                {!chapter.collapsed && (
                  <div className='p-4 space-y-3'>
                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                      <div key={lectureIndex} className='flex items-center justify-between text-sm text-gray-600 bg-white border border-gray-500/20 px-3 py-2 rounded shadow-sm'>
                        <div className='flex items-center gap-2'>
                          <img src={assets.play_icon} alt="" className='w-4' />
                          <span>{lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} min</span>
                        </div>
                        <img 
                          src={assets.cross_icon} 
                          alt="Remove Lecture" 
                          className='w-2.5 cursor-pointer' 
                          onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)} 
                        />
                      </div>
                    ))}
                    <div 
                      onClick={() => handleLecture('add', chapter.chapterId)} 
                      className='text-indigo-600 text-sm cursor-pointer font-medium mt-2 inline-block hover:underline'
                    >
                      + Add Lecture
                    </div>
                  </div>
                )}

              </div>
            ))}

            {/* Add Chapter Button */}
            <div 
              onClick={() => handleChapter('add')} 
              className='text-center border-2 border-dashed border-gray-300 py-3 text-indigo-600 cursor-pointer rounded bg-indigo-50/30 hover:bg-indigo-50/60 font-medium'
            >
              + Add Chapter
            </div>
          </div>
        </div>

        {/* Submit Form Button */}
        <button type="submit" className='bg-black text-white py-3 rounded w-28 font-medium my-4 hover:bg-gray-800 transition-colors'>
          ADD
        </button>
      </form>

      {/* Add Lecture Popup Modal */}
      {showPopup && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white p-6 rounded-lg w-full max-w-sm border shadow-xl text-gray-700 relative'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-800'>Add Lecture</h3>
              <img src={assets.cross_icon} alt="Close" className='w-3 cursor-pointer' onClick={() => setShowPopup(false)} />
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium mb-1'>Lecture Title</p>
                <input 
                  type="text" 
                  className='w-full outline-none border border-gray-500 p-2 rounded'
                  value={lectureDetails.lectureTitle}
                  onChange={e => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                  required
                />
              </div>

              <div>
                <p className='text-sm font-medium mb-1'>Duration (minutes)</p>
                <input 
                  type="number" 
                  className='w-full outline-none border border-gray-500 p-2 rounded'
                  value={lectureDetails.lectureDuration}
                  onChange={e => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                  required
                />
              </div>

              <div>
                <p className='text-sm font-medium mb-1'>Lecture URL</p>
                <input 
                  type="text" 
                  className='w-full outline-none border border-gray-500 p-2 rounded'
                  value={lectureDetails.lectureUrl}
                  onChange={e => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                  required
                />
              </div>

              <div className='flex items-center gap-2 pt-2'>
                <input 
                  type="checkbox" 
                  id="preview"
                  checked={lectureDetails.isPreviewFree}
                  onChange={e => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                />
                <label htmlFor="preview" className='text-sm font-medium cursor-pointer select-none'>Is Preview Free?</label>
              </div>

              <button 
                type="button" 
                onClick={addLecture}
                className='w-full bg-blue-600 text-white py-2 rounded mt-2 font-medium hover:bg-blue-700'
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddCourse