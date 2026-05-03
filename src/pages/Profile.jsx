import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, KeyRound, Crown } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSupabaseConfigured()) {
        setUser({ email: 'mock****@example.com', role: 'Mock User', name: 'mockuser' });
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        const email = session.user.email;
        const [username, domain] = email.split('@');
        const maskedUsername = username.length > 4 ? username.substring(0, 4) + '****' : username + '****';
        const role = email === 'kmatrixstudio@gmail.com' ? 'Admin' : 'User';
        
        setUser({ 
          email: `${maskedUsername}@${domain}`, 
          role,
          name: email.split('@')[0]
        });

        // Check premium status
        try {
          const { data } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('is_premium', true)
            .limit(1)
            .single();
          if (data) setIsPremium(true);
        } catch { /* not premium */ }

        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container page-enter" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading profile…
      </div>
    );
  }

  const fields = [
    { icon: <User size={18} />, label: 'Name', value: user.name },
    { icon: <Mail size={18} />, label: 'Email', value: user.email },
    { icon: <Shield size={18} />, label: 'Role', value: user.role },
  ];

  return (
    <div className="container page-enter" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
        
        {/* Avatar circle */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(47,47,228,0.25), rgba(22,46,147,0.35))',
          border: '2px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem auto', fontSize: '1.6rem', fontWeight: 700,
          color: 'var(--accent-hover)',
          animation: 'scaleIn 0.35s ease both',
        }}>
          {user.name?.charAt(0).toUpperCase() || '?'}
        </div>

        <h1 style={{ textAlign: 'center', marginBottom: '0.3rem', fontSize: '1.5rem' }}>
          Account Profile
        </h1>

        {isPremium && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.4rem', marginBottom: '1.5rem',
          }}>
            <Crown size={15} color="#FFD700" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFD700', letterSpacing: '0.05em' }}>
              PREMIUM
            </span>
          </div>
        )}

        {!isPremium && <div style={{ marginBottom: '1.5rem' }} />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {fields.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              padding: '0.85rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              animation: `slideUp 0.3s ease ${i * 0.06}s both`,
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '8px',
                background: 'rgba(47,47,228,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-hover)', flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {f.label}
                </p>
                <p style={{ fontSize: '0.92rem', fontWeight: 500 }}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn-primary" style={{ flex: 1, gap: '0.4rem' }}>
            <KeyRound size={16} /> Reset Password
          </button>
          {!isPremium && (
            <button
              className="btn-primary"
              onClick={() => navigate('/premium')}
              style={{ flex: 1, gap: '0.4rem', background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))', borderColor: 'rgba(255,215,0,0.25)' }}
            >
              <Crown size={16} color="#FFD700" /> Go Premium
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
