import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Attempting to retrieve Razorpay keys using various common environment variable names
    const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAYKEY_ID || process.env.RAZORPAYKEYID || process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAYKEY_SECRET || process.env.RAZORPAYKEYSECRET || process.env.RAZORPAY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Missing Razorpay Keys in Environment Variables");
      return res.status(500).json({ message: 'Razorpay keys are missing on the server.' });
    }

    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const options = {
      amount: 19900, // ₹199 in paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await instance.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ message: 'Error creating order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
