import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY || '$';
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  // Fetch All Courses safely
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/all');
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch User Data safely
  const fetchUserData = async () => {
    if (user?.publicMetadata?.role === 'educator') {
      setIsEducator(true);
    }
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch User Enrolled Courses safely
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Mark Lecture as Completed in Backend
  const markLectureCompleted = async (courseId, lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message || "Progress Updated");
        await fetchUserEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Add/Update Course Rating in Backend with Notification
  const submitCourseRating = async (courseId, ratingValue) => {
    try {
      const token = await getToken();
      if (!token) {
        return toast.warn("Please sign in to rate this course.");
      }

      // লোডিং নোটিফিকেশন দেখাবে
      const loadingToast = toast.loading("Submitting your rating...");

      const { data } = await axios.post(
        backendUrl + '/api/user/add-rating',
        { courseId, rating: ratingValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // লোডার রিমুভ করবে
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success(data.message || "Thank you for your rating!");
        // রেটিং দেওয়ার পর ডাটা রিলোড ছাড়াই পেজে আপডেট হওয়ার জন্য রি-ফেচ
        await fetchUserEnrolledCourses();
        await fetchAllCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Utility Function: Calculate Average Rating safely
  const calculateRating = (course) => {
    if (!course || !course.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach(rating => {
      totalRating += rating.rating || 0;
    });
    return Math.floor(totalRating / course.courseRatings.length);
  };

  // FIX: Calculate Course Chapter Time safely
  const calculateChapterTime = (chapter) => {
    let time = 0;
    if (chapter) {
      const lectures = chapter.courseContent || chapter.chapterContent || [];
       lectures.forEach((lecture) => {
        time += (lecture.lectureDuration || lecture.duration || 0);
      });
    }
    const hours = Math.floor(time / 60);
    const minutes = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // FIX: Calculate Total No of Lectures safely
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    if (course && course.courseContent) {
      course.courseContent.forEach(chapter => {
        if (chapter) {
          const lectures = chapter.courseContent || chapter.chapterContent || [];
          totalLectures += lectures.length;
        }
      });
    }
    return totalLectures;
  };

  // FIX: Calculate Total Course Duration safely
  const calculateCourseDuration = (course) => {
    let totalDuration = 0;
    if (course && course.courseContent) {
      course.courseContent.forEach(chapter => {
        if (chapter) {
          const lectures = chapter.courseContent || chapter.chapterContent || [];
          lectures.forEach(lecture => {
            totalDuration += lecture.lectureDuration || lecture.duration || 0;
          });
        }
      });
    }
    const hours = Math.floor(totalDuration / 60);
    const minutes = Math.floor(totalDuration % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    enrolledCourses,
    fetchUserEnrolledCourses,
    isEducator,
    setIsEducator,
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
    markLectureCompleted,
    submitCourseRating // এখানে ফাংশনটি পাস করা হলো
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};