import express from 'express';
import { getAllCourse, getCourseId } from '../controllers/courseController.js';

const courseRouter = express.Router();

// ১. সব পাবলিশড কোর্স গেট করার এপিআই রাউট
// URL: /api/course/all
courseRouter.get('/all', getAllCourse);

// ২. নির্দিষ্ট কোর্সের আইডি দিয়ে কোর্স ডেটা গেট করার এপিআই রাউট
// URL: /api/course/:id
courseRouter.get('/:id', getCourseId);

export default courseRouter;