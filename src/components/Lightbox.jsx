import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const Lightbox = ({ item, onClose }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShowPrompt = async () => {
    // Check if logged in
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onClose();
        navigate('/auth');
        return;
      }
    }

    setShowPrompt(true);
    setIsTyping(true);
    setDisplayedText('');
    
    let i = 0;
    const text = item.prompt || 'No prompt available.';
    const speed = 30; // ms per char
    
    const typeWriter = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typeWriter);
        setIsTyping(false);
      }
    }, speed);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--overlay-bg)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'white', padding: '0.5rem', background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}
      >
        <X size={28} />
      </button>

      <div style={{ maxWidth: '90vw', maxHeight: '70vh', display: 'flex', justifyContent: 'center' }}>
        {item.type === 'video' ? (
          <video src={item.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
        ) : (
          <img src={item.url} alt={item.prompt} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
        )}
      </div>

      <div style={{ marginTop: '2rem', width: '90vw', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!showPrompt ? (
          <button className="btn-primary" onClick={handleShowPrompt}>
            <Terminal size={20} /> Show Prompt
          </button>
        ) : (
          <div className="glass-panel" style={{ 
            padding: '1.5rem', 
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{item.title || 'Media Details'}</h3>
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
              {displayedText}
              {isTyping && <span className="typewriter-cursor"></span>}
            </p>
            
            {!isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn-outline" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
