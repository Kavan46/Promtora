import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSupabaseConfigured()) {
        setUser({ email: 'mock****@example.com', role: 'Mock User' });
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
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Account Profile</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" value={user.name} disabled />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
            <input type="text" value={user.email} disabled />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Role</label>
            <input type="text" value={user.role} disabled />
          </div>
          <button className="btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>Reset Password</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
