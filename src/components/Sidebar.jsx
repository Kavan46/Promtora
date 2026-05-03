import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard, Clock, Crown, LogOut, Image as ImageIcon, Plus } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isSupabaseConfigured()) {
        setIsAdmin(true); // Mock admin for testing
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email === 'kmatrixstudio@gmail.com') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    window.location.href = '/auth'; // Hard redirect to clear all SPA states
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Account', icon: <User size={20} />, path: '/profile' },
    { name: 'History', icon: <Clock size={20} />, path: '/history' },
    ...(isAdmin ? [{ name: 'Media', icon: <Plus size={20} />, path: '/admin' }] : []),
    { name: 'Go Premium', icon: <Crown size={20} color="#FFD700" />, path: '/premium' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      
      {/* Top Navbar for mobile & hamburger toggle */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px', 
        display: 'flex', alignItems: 'center', padding: '0 1rem',
        background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)', zIndex: 50,
      }}>
        <button className="btn-icon" onClick={toggleSidebar}>
          <Menu size={28} />
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <ImageIcon color="var(--text-main)" size={24} />
          <span>Promptora</span>
        </Link>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* Sidebar Panel */}
      <div className="glass-panel" style={{
        position: 'fixed', top: 0, bottom: 0, left: 0, width: '280px',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100, display: 'flex', flexDirection: 'column',
        borderRadius: '0 16px 16px 0', borderLeft: 'none'
      }}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <ImageIcon color="var(--text-main)" size={24} />
            <span>Promptora</span>
          </div>
          <button className="btn-icon" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={toggleSidebar}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  background: isActive ? 'var(--glass-highlight)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'background 0.2s ease'
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--glass-border)' }}>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.75rem 1rem', borderRadius: '8px', width: '100%',
              color: '#ff6b6b', transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingTop: '64px', width: '100%', minHeight: '100vh', transition: 'margin-left 0.3s ease' }}>
        {children}
      </main>

    </div>
  );
};

export default Sidebar;
