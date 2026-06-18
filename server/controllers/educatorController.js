// import Course from '../models/Course.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';


import { createClerkClient } from '@clerk/express';
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
});

// Add Course
export const addCourse = async (req, res) => {
    try {

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No userId found"
            });
        }

        console.log("USER ID FROM CONTROLLER:", userId);

        const { courseData } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({
                success: false,
                message: "Thumbnail Image Required"
            });
        }

        const parsedCourseData = JSON.parse(courseData || "{}");

        parsedCourseData.educator = userId;

       const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
    resource_type: "image",
    // আপনি চাইলে এখানে নির্দিষ্ট ফোল্ডারও বলে দিতে পারেন, যেমন: folder: "lms_courses"
});

        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        const newCourse = await Course.create(parsedCourseData);

        return res.status(200).json({
            success: true,
            message: "Course Added Successfully",
            course: newCourse
        });

    } catch (error) {
        console.error("ADD COURSE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Role To Educator
export const updateRoleToEducator = async (req, res) => {
    try {

        const userId = req.userId || req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No userId found"
            });
        }

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Role updated to educator successfully'
        });

    } catch (error) {
        console.error("UPDATE ROLE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        // আমাদের মিডলওয়্যার থেকে সেট করা req.userId নেওয়া হচ্ছে
        const educator = req.userId || req.auth?.userId;

        if (!educator) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Educator ID not found"
            });
        }

        // ডাটাবেজ থেকে এই এডুকেটরের সব কোর্স খুঁজে বের করা
        const courses = await Course.find({ educator });

        // সাকসেস রেসপন্স রিটার্ন
        return res.status(200).json({
            success: true,
            courses
        });

    } catch (error) {
        console.error("GET EDUCATOR COURSES ERROR:", error);
        
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Educator Dashboard Data (Total Earnings, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.userId || req.auth?.userId;

        if (!educator) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Educator ID not found"
            });
        }

        // Fetch all courses for this educator
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from completed purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        return res.status(200).json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });

    } catch (error) {
        console.error("EDUCATOR DASHBOARD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.userId || req.auth?.userId;

        if (!educator) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Educator ID not found"
            });
        }

        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        // Fetch purchases and populate student and course details
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        })
        .populate('userId', 'name imageUrl')
        .populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId ? purchase.courseId.courseTitle : "Deleted Course",
            purchaseDate: purchase.createdAt
        }));

        return res.status(200).json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        console.error("GET ENROLLED STUDENTS DATA ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};