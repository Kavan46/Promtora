import { useState, useEffect } from 'react';
import { Crown, Loader2, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Premium = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
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
        const { data } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_premium', true)
          .order('started_at', { ascending: false })
          .limit(1)
          .single();
          
        if (data) {
          setIsPremium(true);
        }
      } catch (error) {
        // No rows found is handled here as well as real errors
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

    const options = {
      key: keyId,
      amount: 19900, // ₹199 in paise
      currency: "INR",
      name: "ImDeo Premium",
      description: "Monthly Premium Subscription",
      handler: async function (response) {
        try {
          // Save subscription in Supabase
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          const { error } = await supabase.from('user_subscriptions').insert({
            user_id: user.id,
            is_premium: true,
            expires_at: expiresAt.toISOString()
          });

          if (error) throw error;
          
          setIsPremium(true);
          alert("Payment successful! Premium activated.");
        } catch (error) {
          console.error("Error saving subscription:", error);
          alert("Payment succeeded but failed to update database. Please contact support.");
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        email: user.email
      },
      theme: {
        color: "#2F2FE4" // Theme accent color
      },
      modal: {
        ondismiss: function() {
          setProcessing(false);
        }
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <Crown size={64} color="#FFD700" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Upgrade to Premium</h1>
        
        {isPremium ? (
          <div style={{ padding: '2rem', background: 'rgba(77, 255, 77, 0.1)', borderRadius: '12px', border: '1px solid #4dff4d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={48} color="#4dff4d" />
            <h2 style={{ color: '#4dff4d' }}>You are a Premium Member!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Enjoy your exclusive features.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
              Get exclusive access to high-res downloads, advanced prompt generation, and ad-free browsing.
            </p>
            <button 
              className="btn-primary" 
              onClick={handlePayment}
              disabled={processing}
              style={{ fontSize: '1.2rem', padding: '1rem 2rem', background: 'linear-gradient(45deg, #2F2FE4, #162E93)', border: 'none', width: '100%', maxWidth: '300px' }}
            >
              {processing ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 'Go Premium – ₹199/month'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Premium;
