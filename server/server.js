import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'; 
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js'; 
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js'; 
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'; 

const app = express();

// ডাটাবেজ কানেকশন
connectDB();
connectCloudinary(); 

// গ্লোবাল মিডলওয়্যারস
app.use(cors());

// 🚀 ১. STRIPE WEBHOOK (সবার উপরে অরিজিনাল র বডি রিড করার জন্য)
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 🚀 ২. CLERK WEBHOOK (express.json() এর উপরে রাখা নিরাপদ, svix ভেরিফিকেশনের জন্য)
app.post('/api/webhook/clerk', express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString(); // ভেরিফিকেশনের জন্য র বডি ব্যাকআপ রাখা
    }
}), clerkWebhooks);

// ৩. বাকি সব রুটের জন্য সাধারণ বডি পার্সার
app.use(express.json());

// ৪. Clerk মিডলওয়্যার
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
}));

// ৫. সার্ভার হেলথ চেক
app.get('/', (req, res) => res.send("API Working"));

// ৬. বাকি সব নরমাল এপিআই রাউটস
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter); 

// এরর হ্যান্ডলিং মিডলওয়্যার
app.use((err, req, res, next) => {
    if (err) {
        console.error("Server Error Log:", err.message);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));