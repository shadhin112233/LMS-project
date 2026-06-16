import Course from "../models/Course.js";
import User from "../models/User.js";

// Get All Courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .select(['-courseContent', '-enrolledStudents'])
            .populate({ path: 'educator' });

        return res.status(200).json({ 
            success: true, 
            courses 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get Course by Id
export const getCourseId = async (req, res) => {
    const { id } = req.params;

    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' });

        if (!courseData) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            });
        });

        return res.status(200).json({
            success: true,
            courseData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 