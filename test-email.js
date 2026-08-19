import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config({ path: 'apps/auth/.env' });

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'Praman Network <updates@praman.network>',
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Test</p>'
}).then(console.log).catch(console.error);
