import { Webhook } from "svix";
import Stripe from "stripe";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js"; 
import Course from "../models/Course.js"; 

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// =============== CLERK WEBHOOK CONTROLLER ===============
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });
    const { data, type } = req.body;
    switch (type) {
      case 'user.created': {
        const userData = { _id: data.id, email: data.email_addresses[0].email_address, name: data.first_name + " " + data.last_name, imageUrl: data.image_url };
        await User.create(userData);
        return res.json({ success: true });
      }
      case 'user.updated': {
        const userData = { email: data.email_addresses[0].email_address, name: data.first_name + " " + data.last_name, imageUrl: data.image_url };
        await User.findByIdAndUpdate(data.id, userData);
        return res.json({ success: true });
      }
      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        return res.json({ success: true });
      }
      default:
        return res.json({ success: true, message: "Unhandled Clerk event" });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// =============== STRIPE WEBHOOK CONTROLLER (DEBUG VERSION) ===============
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  // 🔍 DEBUG LOGS: এই লগগুলো Vercel-এ আসল রহস্য ফাঁস করবে
  console.log("=== STRIPE WEBHOOK ATTEMPT ===");
  console.log("Stripe-Signature Header Exists?:", !!sig);
  console.log("Using Webhook Secret Key (First 8 chars):", process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 8) : "NOT FOUND!");

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Stripe Event Verified Successfully! Event Type:", event.type);
  } catch (err) {
    console.error(`❌ Webhook Verification Failed: ${err.message}`);
    // 401 এরর দূর করতে এবং ট্রাবলশুট করতে সাময়িকভাবে স্ট্যাটাস কোড ও এরর বডিতে পাঠানো হচ্ছে
    return response.status(400).json({ success: false, message: `Verification Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      try {
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!session.data || session.data.length === 0) {
          console.error("❌ No checkout session found for this payment intent");
          break;
        }

        const { purchaseId } = session.data[0].metadata;
        console.log("🔍 Found Metadata Purchase ID:", purchaseId);

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error(`❌ Purchase ID ${purchaseId} not found in MongoDB`);
          break;
        }

        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId.toString());

        if (!userData || !courseData) {
          console.error(`❌ DB Error: User (${!!userData}) or Course (${!!courseData}) is missing.`);
          break;
        }

        if (!courseData.enrolledStudents) courseData.enrolledStudents = [];
        if (!courseData.enrolledStudents.includes(userData._id)) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
        }

        if (!userData.enrolledCourses) userData.enrolledCourses = [];
        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }

        purchaseData.status = 'completed';
        await purchaseData.save();
        console.log(`🚀 SUCCESS: Purchase ${purchaseId} status updated to COMPLETED!`);

      } catch (dbError) {
        console.error("❌ Mongoose DB Update Error:", dbError.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      try {
        const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId });
        if (session.data && session.data.length > 0) {
          const { purchaseId } = session.data[0].metadata;
          const purchaseData = await Purchase.findById(purchaseId);
          if (purchaseData) {
            purchaseData.status = 'failed';
            await purchaseData.save();
            console.log(`❌ Purchase ${purchaseId} marked as FAILED.`);
          }
        }
      } catch (dbError) {
        console.error("❌ DB Error during payment failure:", dbError.message);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return response.json({ received: true });
};