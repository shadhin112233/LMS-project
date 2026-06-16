// authMiddleware.js
import { createClerkClient } from '@clerk/express';

// Clerk Client ইনস্ট্যান্স তৈরি
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
});

export const protectEducator = async (req, res, next) => {
    try {
        // req.userId (ইনলাইন থেকে আসা) অথবা req.auth (ClerkMiddleware থেকে আসা) চেক করা হচ্ছে
        const userId = req.userId || req.auth?.userId;

        // টার্মিনালে চেক করার জন্য লগ
        console.log("Auth User ID in Middleware:", userId);
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: Please login first.',
                debug: 'Clerk could not resolve userId from token. Ensure a fresh token is passed in headers.' 
            });
        }

        // ইউজার ডাটা এবং রোল চেক করা
        const user = await clerkClient.users.getUser(userId);
        
        if (user.publicMetadata?.role !== 'educator') {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: You are not authorized as an educator.' 
            });
        }

        // কন্ট্রোলারের ব্যবহারের জন্য আইডিটি সেভ করে রাখা হলো
        req.userId = userId;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};