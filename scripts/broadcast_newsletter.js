const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseKey || !resendApiKey) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

async function broadcast() {
  console.log("Starting Newsletter Broadcast...");

  try {
    // 1. Fetch all active subscribers
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('status', 'active');

    if (error) throw error;
    
    if (!subscribers || subscribers.length === 0) {
      console.log("No active subscribers found. Exiting.");
      return;
    }

    console.log(`Found ${subscribers.length} active subscribers.`);

    // 2. Draft the Email
    const subject = "🚀 New Research Published on Praman Network!";
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0E14; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1a2235;">
        <h2 style="color: #00F0FF; margin-bottom: 24px;">New Article Published</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #a0aec0;">
          Hello from Praman Network!
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #a0aec0;">
          A new technical research article has just been published on our Engineering Journal. Dive into the latest zero-knowledge protocols, SDK updates, and security analyses.
        </p>
        <div style="margin: 32px 0;">
          <a href="https://praman.network/blog" style="background-color: #00F0FF; color: #0B0E14; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
            Read the Latest Post
          </a>
        </div>
        <p style="font-size: 12px; color: #4a5568; margin-top: 48px;">
          You are receiving this because you subscribed to the Praman Engineering Newsletter.
        </p>
      </div>
    `;

    // 3. Send emails
    let successCount = 0;
    
    for (const sub of subscribers) {
      try {
        await resend.emails.send({
          from: 'Praman Network <updates@praman.network>', // MUST verify this domain in Resend
          to: sub.email,
          subject: subject,
          html: htmlBody,
        });
        console.log(`Sent to ${sub.email}`);
        successCount++;
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err.message);
      }
    }

    console.log(`Broadcast Complete! Successfully sent ${successCount} out of ${subscribers.length} emails.`);
  } catch (error) {
    console.error("Broadcast failed:", error);
    process.exit(1);
  }
}

broadcast();
