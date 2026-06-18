import User from "../models/User.js"
import Course from "../models/Course.js"
import Purchase from "../models/Purchase.js"
import { CourseProgress } from '../models/CourseProgress.js'
import Stripe from "stripe"

// 1. GET USER DATA
export const getUserData = async (req, res) => {
    try {
        // ১. প্রথম চেষ্টা: Clerk এর নিজস্ব getAuth মেথড থেকে আইডি নেওয়া
        let userId = req.auth?.userId || req.auth?.id;

        // ২. দ্বিতীয় চেষ্টা (আলটিমেট ব্যাকআপ): যদি ক্লার্ক ফেইল করে, সরাসরি টোকেন থেকে আইডি পার্স করা
        if (!userId && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            if (token && token !== 'undefined') {
                // JWT টোকেনের পে-লোড ডিকোড করা (লাইব্রেরি ছাড়াই)
                const base64Url = token.split('.')[1];
                if (base64Url) {
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(function(c) {
                        return '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    
                    const decoded = JSON.parse(jsonPayload);
                    userId = decoded.sub || decoded.userId; // JWT তে Clerk ID 'sub' ফিল্ডে থাকে
                }
            }
        }

        console.log("================ CLERK AUTH DEBUG ================");
        console.log("ডিকোড করা চূড়ান্ত User ID:", userId);
        console.log("==================================================");

        if (!userId) {
            return res.json({ 
                success: false, 
                message: "Unauthorized: Clerk Token থেকে কোনো User ID রিড করা সম্ভব হয়নি!" 
            });
        }

        // ৩. ডাটাবেজ থেকে ইউজার খোঁজা
        const user = await User.findById(userId);

        if(!user){
            return res.json({ 
                success: false, 
                message: `User Not Found! ডাটাবেজে '${userId}' আইডির কোনো ইউজার নেই।` 
            });
        }

        return res.json({ success: true, user });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// 2. USER ENROLLED COURSES (ভিডিওর মতো প্রোগ্রেস ডাটা সহ ফিক্সড)
export const userEnrolledCourses = async (req, res) => {
    try {
        let userId = req.auth?.userId || req.auth?.id;
        
        if (!userId && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
            userId = decoded.sub;
        }

        if (!userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // ইউজারের এনরোল করা কোর্সগুলো নিয়ে আসা
        const userData = await User.findById(userId).populate('enrolledCourses');

        if (!userData) {
            return res.json({ success: false, message: "User Not Found" });
        }

        // প্রতিটি কোর্সের মোট লেকচার সংখ্যা এবং কমপ্লিটেড লেকচার ডাটাবেজ থেকে ক্যালকুলেট করা
        const enrolledCoursesWithProgress = await Promise.all(
            userData.enrolledCourses.map(async (course) => {
                // টোটাল লেকচার কাউন্ট
                let totalLectures = 0;
                if (course.courseContent) {
                    course.courseContent.forEach((chapter) => {
                        if (chapter.chapterContent) {
                            totalLectures += chapter.chapterContent.length;
                        }
                    });
                }

                // ডাটাবেজ থেকে এই কোর্সের প্রোগ্রেস রেকর্ড খোঁজা
                const progressData = await CourseProgress.findOne({ userId, courseId: course._id });
                
                return {
                    ...course._doc,
                    totalLectures,
                    lectureCompleted: progressData ? progressData.lectureCompleted.length : 0
                };
            })
        );

        return res.json({ success: true, enrolledCourses: enrolledCoursesWithProgress });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// 3. PURCHASE COURSE
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        
        // নিরাপদ Clerk ID ব্যাকআপ মেকানিজম
        let userId = req.auth?.userId || req.auth?.id;
        if (!userId && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            if (token && token !== 'undefined') {
                const base64Url = token.split('.')[1];
                if (base64Url) {
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
                    userId = decoded.sub || decoded.userId;
                }
            }
        }

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' });
        }

        // ডিসকাউন্ট হিসাব করে ফাইনাল অ্যামাউন্ট বের করা
        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)).toFixed(2),
        }

        // নতুন পারচেজ রেকর্ড তৈরি করা
        const newPurchase = await Purchase.create(purchaseData);

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = process.env.CURRENCY.toLowerCase();

        // Stripe এর জন্য লাইন আইটেম তৈরি করা
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount * 100)
            },
            quantity: 1
        }];

        // Stripe চেকআউট সেশন তৈরি করা
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        });

        return res.json({ success: true, session_url: session.url });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// 4. Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId, lectureId } = req.body;

        // ডাটাবেজে এই ইউজার এবং কোর্সের কোনো প্রগ্রেস রেকর্ড আছে কিনা খোঁজা হচ্ছে
        let progressData = await CourseProgress.findOne({ userId, courseId });

        if (progressData) {
            // যদি লেকচারটি আগে থেকেই কমপ্লিট করা থাকে
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' });
            }

            // নতুন লেকচার আইডি যুক্ত করা হচ্ছে
            progressData.lectureCompleted.push(lectureId);
            await progressData.save();
        } else {
            // যদি কোনো প্রগ্রেস না থাকে, তবে একদম নতুন রেকর্ড তৈরি করা হচ্ছে
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            });
        }

        return res.json({ success: true, message: 'Progress Updated' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 5. Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.body;

        // ইউজারের নির্দিষ্ট কোর্সের প্রগ্রেস ডাটাবেজ থেকে নিয়ে আসা হচ্ছে
        const progressData = await CourseProgress.findOne({ userId, courseId });

        res.json({ success: true, progressData });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 6. Add User Ratings to Course
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Details' });
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        // ইউজার আগে কোনো রেটিং দিয়েছে কিনা তার ইনডেক্স খোঁজা হচ্ছে
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // আগের দেওয়া রেটিংটি আপডেট করা হচ্ছে
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // একদম নতুন রেটিং অবজেক্ট পুশ করা হচ্ছে
            course.courseRatings.push({ userId, rating });
        }

        // ডাটাবেজে курс অবজেক্টটি সেভ করা হচ্ছে
        await course.save();

        return res.json({ success: true, message: 'Rating Added Successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};