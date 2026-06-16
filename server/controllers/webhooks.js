import { Webhook } from "svix";
import Stripe from "stripe";
import User from "../models/User.js";
// টিউটোরিয়াল অনুযায়ী নিচের মডেল দুটো ইমপোর্ট করতে হবে
import Purchase from "../models/Purchase.js"; 
import Course from "../models/Course.js"; 

// ১. Stripe Instance তৈরি (image_ecff01.jpg অনুযায়ী)
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
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({ success: true });
        break;
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({ success: true });
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        res.json({ success: true });
        break;
      }

      default:
        res.json({ success: true, message: "Unhandled Clerk event" });
        break;
    }

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// =============== STRIPE WEBHOOK CONTROLLER ===============
// (image_ecff01.jpg থেকে image_ecef63.jpg এর স্ক্রিনশট অনুযায়ী)
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    // Stripe Event ভেরিফাই করা
    event = stripeInstance.webhooks.constructEvent(
      request.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Checkout Session থেকে মেটাডাটা বের করা (image_ecf7bd.jpg)
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      // ডাটাবেজে পারচেজ ও ইউজার আপডেট করা (image_ecf722.jpg, image_ecf39b.jpg)
      const purchaseData = await Purchase.findById(purchaseId);
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId.toString());

      // কোর্সে স্টুডেন্ট পুশ করা এবং সেভ করা
      courseData.enrolledStudents.push(userData._id);
      await courseData.save();

      // ইউজারে কোর্স আইডি পুsh করা এবং সেভ করা
      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      // পারচেজ স্ট্যাটাস completed করা
      purchaseData.status = 'completed';
      await purchaseData.save();

      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      // পেমেন্ট ফেইল হলে স্ট্যাটাস failed করা (image_ecef63.jpg)
      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = 'failed';
      await purchaseData.save();

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Stripe-কে রেসপন্স পাঠানো (image_ecef63.jpg)
  response.json({ received: true });
};