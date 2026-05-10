import { useState, useEffect } from 'react';
import { Crown, Loader2, CheckCircle, Sparkles, Shield, Zap, Eye } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: <Eye size={20} />, title: 'Ad-Free Browsing', desc: 'View prompts instantly without ads' },
  { icon: <Sparkles size={20} />, title: 'HD Downloads', desc: 'Access high-res media originals' },
  { icon: <Zap size={20} />, title: 'Instant Prompts', desc: 'No wait time for prompt generation' },
  { icon: <Shield size={20} />, title: 'Priority Support', desc: 'Get help when you need it' },
];

const Premium = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);

      // Check if user is already premium
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_premium', true)
          .order('expires_at', { ascending: false })
          .limit(1)
          .single();
          
        if (data) {
          // Check if subscription is still valid
          const now = new Date();
          const expiry = new Date(data.expires_at);
          if (expiry > now) {
            setIsPremium(true);
            setSubscription(data);
          }
        }
      } catch (error) {
        console.warn('Subscription fetch:', error.message);
      }
      
      setLoading(false);
    };
    
    fetchUserAndSubscription();
  }, [navigate]);

  const handlePayment = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      alert("Razorpay Key ID is missing! Please add VITE_RAZORPAY_KEY_ID to your .env.local file.");
      return;
    }

    setProcessing(true);

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Promptora Premium",
        description: "Monthly Premium Subscription",
        handler: async function (response) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // 2. Verify payment on backend and update Supabase
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user.id
              })
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            setIsPremium(true);
            alert("Payment successful! Premium activated.");
            window.location.href = "https://promptora.beauty";
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Payment succeeded but verification failed. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          email: user.email
        },
        theme: {
          color: "#2F2FE4"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-enter" style={{ padding: '4rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--accent-color)' }} />
      </div>
    );
  }

  return (
    <div className="container page-enter" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Crown icon with glow */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))',
          border: '1px solid rgba(255,215,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 0 30px rgba(255,215,0,0.15)',
          animation: 'scaleIn 0.4s ease both',
        }}>
          <Crown size={38} color="#FFD700" />
        </div>

        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 700 }}>
          Upgrade to Premium
        </h1>
        
        {isPremium ? (
          <div style={{
            padding: '2rem', marginTop: '1.5rem',
            background: 'rgba(77, 255, 77, 0.06)',
            borderRadius: '14px',
            border: '1px solid rgba(77,255,77,0.25)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
            animation: 'scaleIn 0.35s ease both',
          }}>
            <CheckCircle size={44} color="#4dff4d" />
            <h2 style={{ color: '#4dff4d', fontSize: '1.3rem' }}>You're a Premium Member!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Enjoy ad-free browsing and all exclusive features.</p>
            {subscription && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Due Date: </span>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                  {new Date(subscription.expires_at).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Unlock the full Promptora experience with premium features.
            </p>

            {/* Feature grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem', marginBottom: '2rem', textAlign: 'left',
            }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  animation: `slideUp 0.35s ease ${i * 0.08}s both`,
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(47, 47, 228, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'var(--accent-hover)',
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{f.title}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: '0.3rem',
              marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹199</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/month</span>
            </div>

            <br />
            <button 
              className="btn-primary" 
              onClick={handlePayment}
              disabled={processing}
              style={{
                fontSize: '1rem', padding: '0.85rem 2.5rem',
                background: 'linear-gradient(135deg, #2F2FE4, #162E93)',
                border: '1px solid rgba(47,47,228,0.4)',
                borderRadius: '50px',
              }}
            >
              {processing ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><Crown size={18} color="#FFD700" /> Go Premium</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Premium;
