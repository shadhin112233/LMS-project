import { createContext, useEffect, useState } from 'react';
import { dummyCourses } from '../assets/assets'; 

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY;
    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);

    // Fetch All Courses
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    }

    // Function to calculate average rating of course
    const calculateRating = (course) => {
        // যদি courseRating না থাকে অথবা খালি অ্যারে হয়
        if (!course || !course.courseRatings || course.courseRatings.length === 0) {
            return 0;
        }
        
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });
        
        // দশমিকের পর ১ ঘর পর্যন্ত সুন্দর দেখানোর জন্য toFixed(1) বা Math.round করতে পারেন, 
        // তবে এখানে নম্বর রিটার্ন রাখা হলো।
        return totalRating / course.courseRatings.length;
    }

    useEffect(() => {
        fetchAllCourses();
    }, []);

    const value = {
        currency,
        allCourses,
        calculateRating,
        isEducator,setIsEducator
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}