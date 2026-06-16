import express from 'express'
import { getAuth } from '@clerk/express'
import { getUserData, purchaseCourse, userEnrolledCourses } from '../controllers/userController.js'

const userRouter = express.Router()

const clerkAuthCheck = (req, res, next) => {
    try {
        const authState = getAuth(req);
        req.auth = authState;
        next();
    } catch (error) {
        next(error);
    }
};

userRouter.get('/data', clerkAuthCheck, getUserData)
userRouter.get('/enrolled-courses', clerkAuthCheck, userEnrolledCourses)
userRouter.post('/purchase', clerkAuthCheck, purchaseCourse)

export default userRouter;