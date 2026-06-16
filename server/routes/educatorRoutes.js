// routes/educatorRoutes.js
import express from 'express';
import { 
    addCourse, 
    updateRoleToEducator, 
    getEducatorCourses, 
    educatorDashboardData, 
    getEnrolledStudentsData 
} from '../controllers/educatorController.js'; 
import upload from '../config/multer.js';
import { getAuth } from '@clerk/express';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

const resolveUser = (req, res, next) => {
    try {
        const clerkAuth = getAuth(req);
        const userId = clerkAuth?.userId || req.auth?.userId;

        console.log("Resolved User ID in Router:", userId);

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized: No userId found" 
            });
        }

        req.userId = userId;
        next();
    } catch (error) {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Clerk authentication failed" });
        }
        req.userId = userId;
        next();
    }
};

educatorRouter.get('/update-role', resolveUser, updateRoleToEducator);

educatorRouter.post(
    '/add-course',
    upload.single('image'),
    resolveUser,
    protectEducator, 
    addCourse
);

educatorRouter.get('/courses', resolveUser, protectEducator, getEducatorCourses);

educatorRouter.get('/dashboard', resolveUser, protectEducator, educatorDashboardData);

educatorRouter.get('/enrolled-students', resolveUser, protectEducator, getEnrolledStudentsData);

export default educatorRouter;