import User from "../models/User.js"
import Course from "../models/Course.js"
import Purchase from "../models/Purchase.js"
import Stripe from "stripe"

// ==========================================
// 1. GET USER DATA
// ==========================================
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

// ==========================================
// 2. USER ENROLLED COURSES
// ==========================================
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

        const userData = await User.findById(userId).populate('enrolledCourses');

        if (!userData) {
            return res.json({ success: false, message: "User Not Found" });
        }

        return res.json({ success: true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// ==========================================
// 3. PURCHASE COURSE
// ==========================================
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