import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const calculateStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength += 1;
    if (pass.length > 7 && /[A-Z]/.test(pass)) strength += 1;
    if (pass.length > 7 && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = calculateStrength(password);
  const strengthColors = ['#ff4d4d', '#ffa64d', '#ffdb4d', '#4dff4d'];
  const strengthWidths = ['0%', '33%', '66%', '100%'];

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        setLoading(false);
        // Mock successful login/signup and go to admin for testing
        navigate('/admin');
      }, 1000);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user && data.user.email === 'kmatrixstudio@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Sign up successful! Please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error) {
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {!isSupabaseConfigured() && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,179,0,0.1)', border: '1px solid var(--accent-color)', borderRadius: '8px', marginBottom: '1.5rem', color: 'var(--accent-color)', fontSize: '0.9rem' }}>
            Supabase not configured. Login is mocked.
          </div>
        )}

        {message && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,0,0,0.1)', color: '#ff6b6b', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '0.75rem', top: '50%', 
                  transform: 'translateY(-50%)', color: 'var(--text-muted)' 
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {!isLogin && password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: strengthWidths[strength], 
                    background: strengthColors[strength],
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
                  {strength === 0 && 'Weak'}
                  {strength === 1 && 'Fair'}
                  {strength === 2 && 'Good'}
                  {strength === 3 && 'Strong'}
                </p>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
