import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id } = req.body;
  const authHeader = req.headers.authorization;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id || !authHeader) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAYKEY_SECRET || process.env.RAZORPAYKEYSECRET || process.env.RAZORPAY_SECRET;
    
    if (!secret) {
      console.error("Missing Razorpay Secret in Environment Variables");
      return res.status(500).json({ message: 'Razorpay secret is missing on the server.' });
    }
    
    // Create HMAC signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Signature is valid. Update Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabase.from('user_subscriptions').insert({
      user_id: user_id,
      is_premium: true,
      expires_at: expiresAt.toISOString()
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: 'Payment verified and subscription activated successfully' });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
