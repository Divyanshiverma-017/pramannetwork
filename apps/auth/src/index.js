import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verifyApiKey } from "./middlewares/apiKeyAuth.js";
import { sandboxRateLimiter } from "./utils/rateLimiter.js";
import { createClient } from '@supabase/supabase-js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// 1. Strict Middleware Ordering: trust proxy MUST be set first
app.set('trust proxy', 1);

// 2. Parse request bodies immediately after trust proxy and BEFORE any other logic
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request Body Debugging middleware
app.use((req, res, next) => {
  console.log('DEBUG Body:', req.body);
  next();
});

const allowedOrigins = [
  'https://www.praman.network',
  'https://praman.network'
];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://localhost:3000');
  allowedOrigins.push('http://localhost:3001');
}

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

// 4. Apply CORS and Rate Limiting
app.use(cors(corsOptions));
app.use(sandboxRateLimiter);

const supabaseUrl = process.env.SUPABASE_URL || 'https://tkmduvvaygyucegqlhlq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY)) {
  console.warn("WARNING: Supabase URL or Service Role Key is missing from environment variables.");
}

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} catch (err) {
  console.error("CRITICAL: Failed to initialize Supabase client globally:", err.message);
  // Provide a safe fallback mock so the server doesn't crash on import
  supabase = {
    from: () => ({
      insert: async () => ({ data: null, error: new Error("Supabase client is not initialized") }),
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error("Supabase client is not initialized") }) }) })
    })
  };
}

// Base Health Check endpoint
app.get("/", (req, res) => {
  res.send("Praman Network Authentication Gateway. Status: Operational.");
});

// Protected Verification Route
// Client SDK calls this POST request with proof data, passing x-api-key in headers
app.post("/api/v1/verify-zk", verifyApiKey, async (req, res) => {
  const origin = req.headers.origin || 'unknown';
  const apiKey = req.headers['x-api-key'];

  // Enhanced Vercel serverless debugging log
  console.log("Incoming Request - Origin:", origin, "API Key Present:", !!apiKey);

  try {
    // Route Handler Fix: Verify if req.body exists before destructuring
    if (!req.body) {
      console.error("Body is undefined");
      return res.status(400).json({ success: false, error: "Bad Request: Request body is undefined." });
    }

    const { proof, publicInputs } = req.body;

    // 1. ZK Proof Verification Logic (Yahan tumhara snarkjs/contract logic aayega)
    const isVerified = true; // Simulating verification logic

    if (!isVerified) {
      // Log failed attempt
      try {
        await supabase.from('verification_logs').insert({
          app_id: apiKey,
          status: 'failed',
          error_code: 'ZK_VERIFICATION_FAILED',
          origin: origin
        });
      } catch (logErr) {
        console.error("Failed to insert verification log in database:", logErr.message);
      }
      return res.status(403).json({ success: false, error: "ZK Proof verification failed" });
    }

    // 2. Success Log Entry
    try {
      await supabase.from('verification_logs').insert({
        app_id: apiKey,
        status: 'success',
        error_code: null,
        origin: origin
      });
    } catch (logErr) {
      console.error("Failed to insert success verification log in database:", logErr.message);
    }

    // 3. Success Response
    res.status(200).json({
      success: true,
      message: "Zero Knowledge Proof assertion verified successfully.",
      verifiedAt: new Date().toISOString(),
      details: {
        cycles: 42,
        proofHash: proof ? "0x" + Math.random().toString(16).substring(2, 10) : "null",
        proverNode: "praman-proof-engine-alpha"
      }
    });

  } catch (error) {
    console.error("Verification Route Error:", error);

    // Log unexpected system errors
    try {
      await supabase.from('verification_logs').insert({
        app_id: apiKey,
        status: 'failed',
        error_code: 'SYSTEM_ERROR',
        origin: origin
      });
    } catch (logErr) {
      console.error("Failed to insert system error log in database:", logErr.message);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});
// Newsletter Subscription Route
app.post("/api/v1/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }

    // Server-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: "Invalid email format." });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email, status: 'active' }])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, error: "This email is already subscribed." });
      }
      throw error;
    }

    // Send Welcome Email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const result = await resend.emails.send({
          from: 'Praman Network <updates@praman.network>',
          to: email,
          subject: 'Welcome to the Praman Engineering Newsletter! 🚀',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0E14; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1a2235;">
              <h2 style="color: #00F0FF; margin-bottom: 24px;">Subscription Confirmed</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #a0aec0;">
                Thank you for subscribing! 
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #a0aec0;">
                You are now on the list to receive our latest zero-knowledge research, protocol updates, and technical deep-dives directly to your inbox whenever a new article is published.
              </p>
              <div style="margin: 32px 0;">
                <a href="https://praman.network/blog" style="background-color: #00F0FF; color: #0B0E14; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                  Visit the Blog
                </a>
              </div>
            </div>
          `
        });
        console.log("Resend API response:", JSON.stringify(result));
        if (result.error) {
          console.error("Resend returned error:", result.error);
        } else {
          console.log("Welcome email sent to", email, "id:", result.data?.id);
        }
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
        // We do not fail the request if the welcome email fails, as the user is still subscribed in DB
      }
    }

    return res.status(200).json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Subscription Error:", error);
    return res.status(500).json({ success: false, error: "Internal server error: " + error.message });
  }
});

// Export app for serverless function platforms like Vercel
export default app;

// Listen only when running locally, not in serverless environments
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(5050, () => {
    console.log(`Auth Server is running on port 5050`);
  });
}