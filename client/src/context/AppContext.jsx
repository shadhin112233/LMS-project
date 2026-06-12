import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyCourses } from '../assets/assets'; 
import humanizeDuration from 'humanize-duration';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
        const navigate = useNavigate();

    const currency = import.meta.env.VITE_CURRENCY || '$';
    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    // ১. এনরোল করা কোর্সের জন্য স্টেট ডিক্লেয়ারেশন
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    }

    // ২. ইউজার এনরোল করা কোর্স ফেচ করার ফাংশন
    const fetchUserEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses);
    }

    const calculateRating = (course) => {
        if (!course || !course.courseRatings || course.courseRatings.length === 0) {
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });
        return totalRating / course.courseRatings.length;
    }

    const shortEnglishHumanizer = humanizeDuration.humanizer({
        language: "shortEn",
        languages: {
            shortEn: {
                h: () => "h",
                m: () => "m",
            },
        },
        spacer: "",
        conjunction: " ",
    });

    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += Number(lecture.lectureDuration));
        return shortEnglishHumanizer(time * 60 * 1000, { units: ["h", "m"], round: true });
    }

    const calculateCourseDuration = (course) => {
        let time = 0;
        course.courseContent.map((chapter) => chapter.chapterContent.map((lecture) => time += Number(lecture.lectureDuration)));
        return shortEnglishHumanizer(time * 60 * 1000, { units: ["h", "m"], round: true });
    }

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    // ৩. useEffect-এর ভেতর দুটি ফাংশনই কল করা হয়েছে
    useEffect(() => {
        fetchAllCourses();
        fetchUserEnrolledCourses();
    }, []);

    // ৪. value অবজেক্টে স্টেট ও ফাংশন দুটি পাস করা হয়েছে
    const value = {

        navigate ,
        
        currency,
        allCourses,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateChapterTime,      
        calculateCourseDuration,  
        calculateNoOfLectures,
        enrolledCourses,
        fetchUserEnrolledCourses     
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}