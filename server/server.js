import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'; 
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js'; 
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js'; 

const app = express();

// ডাটাবেজ কানেকশন
connectDB();
connectCloudinary(); 

// গ্লোবাল মিডলওয়্যারস
app.use(cors());
app.use(express.json());

// 🌟 Clerk মিডলওয়্যার ডিফাইন করার সময় keys গুলো এক্সপ্লিসিটলি পাস করে দেওয়া হলো
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
}));

// সব রাউটস
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter); 

// এরর হ্যান্ডলিং মিডলওয়্যার
app.use((err, req, res, next) => {
    if (err) {
        console.error("Clerk Error Handler:", err.message);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));