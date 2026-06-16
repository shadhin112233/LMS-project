import express from 'express';
import { getAuth } from '@clerk/express';
import { 
    getUserData, 
    purchaseCourse, 
    userEnrolledCourses, 
    updateUserCourseProgress, 
    getUserCourseProgress, 
    addUserRating
} from '../controllers/userController.js';

const userRouter = express.Router();

// Clerk অ্যাথেন্টিকেশন চেক করার মিডলওয়্যার
const clerkAuthCheck = (req, res, next) => {
    try {
        const authState = getAuth(req);
        req.auth = authState;
        next();
    } catch (error) {
        next(error);
    }
};

// ১. গেট ইউজার ডাটা রাউট
userRouter.get('/data', clerkAuthCheck, getUserData);

// ২. এনরোল করা কোর্সের লিস্ট পাওয়ার রাউট
userRouter.get('/enrolled-courses', clerkAuthCheck, userEnrolledCourses);

// ৩. কোর্স পারচেজ বা কেনার রাউট
userRouter.post('/purchase', clerkAuthCheck, purchaseCourse);

// ৪. ইউজার কোর্স প্রগ্রেস আপডেট করার রাউট
userRouter.post('/update-course-progress', clerkAuthCheck, updateUserCourseProgress);

// ৫. ইউজারের কোর্স প্রগ্রেস ডাটা গেট করার রাউট
userRouter.post('/get-course-progress', clerkAuthCheck, getUserCourseProgress);
userRouter.post('/add-rating', clerkAuthCheck, addUserRating);

export default userRouter;