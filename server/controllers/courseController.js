import Course from "../models/Course.js";
import User from "../models/User.js";

// ==========================================
// 1. Get All Courses (সব পাবলিশড কোর্স আনা)
// ==========================================
export const getAllCourse = async (req, res) => {
    try {
        // courseContent এবং enrolledStudents বাদ দিয়ে শুধু প্রয়োজনীয় ডেটা আনা হচ্ছে
        const courses = await Course.find({ isPublished: true })
            .select('-courseContent -enrolledStudents')
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

// ==========================================
// 2. Get Course by Id (আইডি দিয়ে নির্দিষ্ট কোর্স আনা)
// ==========================================
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

        // Mongoose Document-কে সাধারণ JavaScript Object-এ রূপান্তর (যাতে ক্র্যাশ না করে)
        const courseObject = courseData.toObject();

        // প্রিভিউ ফ্রি না হলে লেকচারের URL হাইড/ফাঁকা করার লজিক
        if (courseObject.courseContent && Array.isArray(courseObject.courseContent)) {
            courseObject.courseContent.forEach(chapter => {
                if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
                    chapter.chapterContent.forEach(lecture => {
                        if (!lecture.isPreviewFree) {
                            lecture.lectureUrl = ""; 
                        }
                    });
                }
            });
        }

        return res.status(200).json({
            success: true,
            courseData: courseObject
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};