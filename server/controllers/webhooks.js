import { Webhook } from "svix";
import Stripe from "stripe";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js"; 
import Course from "../models/Course.js"; 

// ১. Stripe Instance তৈরি
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

// =============== STRIPE WEBHOOK CONTROLLER (FIXED) ===============
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
    console.error(`❌ Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      try {
        // Checkout Session থেকে মেটাডাটা বের করা
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!session.data || session.data.length === 0) {
          console.error("❌ No checkout session found for this payment intent");
          break;
        }

        const { purchaseId } = session.data[0].metadata;

        // ডাটাবেজ থেকে পারচেজ ডাটা খোঁজা
        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error(`❌ Purchase ID ${purchaseId} not found in DB`);
          break;
        }

        // ইউজার ও কোর্স ডাটা খোঁজা
        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId.toString());

        if (!userData || !courseData) {
          console.error("❌ User or Course not found in DB");
          break;
        }

        // ১. কোর্সে স্টুডেন্ট পুশ করা (অ্যারে চেক ও ডুপ্লিকেট রোধ)
        if (!courseData.enrolledStudents) courseData.enrolledStudents = [];
        if (!courseData.enrolledStudents.includes(userData._id)) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
        }

        // ২. ইউজারে কোর্স আইডি পুশ করা (অ্যারে চেক ও ডুপ্লিকেট রোধ)
        if (!userData.enrolledCourses) userData.enrolledCourses = [];
        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }

        // ৩. পারচেজ স্ট্যাটাস completed করা
        purchaseData.status = 'completed';
        await purchaseData.save();

        console.log(`✅ Purchase ${purchaseId} successfully updated to COMPLETED!`);

      } catch (dbError) {
        console.error("❌ Error updating database during successful payment:", dbError.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      try {
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (session.data && session.data.length > 0) {
          const { purchaseId } = session.data[0].metadata;

          // পেমেন্ট ফেইল হলে স্ট্যাটাস failed করা
          const purchaseData = await Purchase.findById(purchaseId);
          if (purchaseData) {
            purchaseData.status = 'failed';
            await purchaseData.save();
            console.log(`❌ Purchase ${purchaseId} marked as FAILED.`);
          }
        }
      } catch (dbError) {
        console.error("❌ Error updating database during failed payment:", dbError.message);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Stripe-কে রেসপন্স পাঠানো
  response.json({ received: true });
};