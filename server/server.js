import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'; 
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js'; 
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js'; 
// ওয়েবহুক কন্ট্রোলারগুলো ইমপোর্ট করা হলো
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'; 

const app = express();

// ডাটাবেজ কানেকশন
connectDB();
connectCloudinary(); 

// গ্লোবাল মিডলওয়্যারস
app.use(cors());

// ⚠️ STRIPE WEBHOOK ROUTE (অবশ্যই express.json() এর উপরে থাকতে হবে)
// টিউটোরিয়ালের লাইন ২৯ অনুযায়ী এটি express.raw ব্যবহার করবে
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// বাকি সব নরমাল রাউটের জন্য বডি পার্সার
app.use(express.json());

// 🌟 Clerk মিডলওয়্যার ডিফাইন করা হলো
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
}));

// Home Route (টিউটোরিয়ালের লাইন ২৪ অনুযায়ী - সার্ভার লাইভ চেক করার জন্য)
app.get('/', (req, res) => res.send("API Working"));

// CLERK WEBHOOK ROUTE (টিউটোরিয়ালের লাইন ২৫ অনুযায়ী)
app.post('/api/webhook/clerk', clerkWebhooks);

// বাকি সব এপিআই রাউটস
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter); 

// এরর হ্যান্ডলিং মিডলওয়্যার
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