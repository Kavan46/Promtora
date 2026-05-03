import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Terminal, ChevronDown, ChevronUp, Crown, Loader2, FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const Lightbox = ({ item, onClose }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [isPremium, setIsPremium] = useState(false);
  const promptRef = useRef(null);
  const navigate = useNavigate();

  // Save to viewing history
  useEffect(() => {
    if (!item) return;
    try {
      const history = JSON.parse(localStorage.getItem('promptora_history') || '[]');
      const entry = {
        id: item.id, title: item.title, url: item.url,
        category: item.category, type: item.type, viewedAt: new Date().toISOString(),
      };
      // Remove duplicate then prepend
      const updated = [entry, ...history.filter(h => h.id !== item.id)].slice(0, 50);
      localStorage.setItem('promptora_history', JSON.stringify(updated));
    } catch { /* ignore storage errors */ }
  }, [item]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Check premium status on mount
  useEffect(() => {
    const checkPremium = async () => {
      if (!isSupabaseConfigured()) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const { data } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_premium', true)
          .order('expires_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          const now = new Date();
          const expiry = new Date(data.expires_at);
          if (expiry > now) {
            setIsPremium(true);
          }
        }
      } catch { /* not premium */ }
    };
    checkPremium();
  }, []);

  // Ad countdown timer
  useEffect(() => {
    if (!showAd) return;
    if (adCountdown <= 0) {
      setShowAd(false);
      startTypewriter();
      return;
    }
    const timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showAd, adCountdown]);

  const startTypewriter = () => {
    setShowPrompt(true);
    setIsTyping(true);
    setDisplayedText('');

    let i = 0;
    const text = item.prompt || 'No prompt available.';
    const speed = 18;

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

    // Premium users skip ads
    if (isPremium) {
      startTypewriter();
      return;
    }

    // Show interstitial ad for non-premium users
    setShowAd(true);
    setAdCountdown(5);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item) return null;

  const promptText = item.prompt || 'No prompt available.';
  const isLongPrompt = promptText.length > 200;

  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-hover)', textDecoration: 'underline' }}>
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="lightbox-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      {/* Close button */}
      <button className="lightbox-close-btn" onClick={onClose} aria-label="Close">
        <X size={24} />
      </button>

      {item.type === 'guide' ? (
        <div className="glass-panel lightbox-prompt-panel" style={{ width: '90vw', maxWidth: '750px', animation: 'scaleIn 0.25s ease both', padding: '1.5rem', marginTop: '2rem' }}>
           <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              {/* Left column: Small image */}
              <img src={item.url} alt={item.title || 'Cover'} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
              
              {/* Right column: Content */}
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                 <div className="lightbox-prompt-header" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{item.title || 'Guide'}</h3>
                    {item.category && <span className="lightbox-prompt-badge">{item.category}</span>}
                 </div>

                 {!showPrompt && !showAd ? (
                    <button className="btn-primary lightbox-show-prompt-btn" onClick={handleShowPrompt} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                       <Terminal size={16} /> <span>Show Guide</span>
                       {!isPremium && <span style={{ fontSize: '0.7rem', opacity: 0.65, marginLeft: '0.25rem' }}>(Ad)</span>}
                    </button>
                 ) : showAd ? (
                    /* Ad Interstitial */
                    <div className="lightbox-ad-container" style={{ padding: '0.5rem 0', animation: 'fadeIn 0.3s ease both' }}>
                       <div className="lightbox-ad-header">
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advertisement</span>
                          <span className="lightbox-ad-timer">Skip in {adCountdown}s</span>
                       </div>
                       <div className="lightbox-ad-slot" style={{ minHeight: '120px' }}>
                          <div className="lightbox-ad-placeholder">
                             <p style={{ fontWeight: '600' }}>Ad Space</p>
                          </div>
                       </div>
                       <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                         <button
                           className="btn-primary"
                           onClick={() => navigate('/premium')}
                           style={{ fontSize: '0.8rem', padding: '0.5rem 1.2rem', gap: '0.4rem' }}
                         >
                           <Crown size={14} color="#FFD700" />
                           Go Premium — No Ads
                         </button>
                       </div>
                    </div>
                 ) : (
                    /* Prompt Text */
                    <div style={{ animation: 'fadeIn 0.3s ease both' }}>
                       <div
                          className={`lightbox-prompt-text ${!expanded && isLongPrompt ? 'clamped' : ''}`}
                          onClick={() => { if (!isTyping && isLongPrompt) setExpanded(prev => !prev); }}
                          style={{ cursor: (!isTyping && isLongPrompt) ? 'pointer' : 'text' }}
                       >
                          {renderTextWithLinks(displayedText)}
                          {isTyping && <span className="typing-indicator"><span>.</span><span>.</span><span>.</span></span>}
                       </div>

                       {!isTyping && isLongPrompt && (
                         <button className="lightbox-expand-btn" onClick={() => setExpanded(prev => !prev)}>
                           {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {expanded ? 'Show Less' : 'Show More'}
                         </button>
                       )}

                       {!isTyping && (
                         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                           <button className="lightbox-copy-btn" onClick={handleCopy} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                             {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Guide'}
                           </button>
                         </div>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      ) : (
        <>
          {/* Media preview */}
          <div className="lightbox-media-wrap" style={{ position: 'relative' }}>
            {item.type === 'video' ? (
              <video
                src={item.url}
                controls
                autoPlay
                className="lightbox-media"
              />
            ) : (
              <img
                src={item.url}
                alt={item.title || item.prompt}
                className="lightbox-media"
              />
            )}

            {/* Loading overlay over image when generating prompt */}
            {isTyping && (
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '0.5rem 1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.3s ease', zIndex: 10 }}>
                <Loader2 size={16} className="animate-spin" color="var(--accent-hover)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Loading Prompt...</span>
              </div>
            )}
          </div>

          {/* Prompt area */}
          <div className="lightbox-prompt-area">
            {!showPrompt && !showAd ? (
              <button className="btn-primary lightbox-show-prompt-btn" onClick={handleShowPrompt}>
                <Terminal size={18} />
                <span>Show Prompt</span>
                {!isPremium && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.65, marginLeft: '0.25rem' }}>(Ad)</span>
                )}
              </button>
            ) : showAd ? (
              /* ── Ad Interstitial ── */
              <div className="glass-panel lightbox-ad-container" style={{ animation: 'scaleIn 0.3s ease both' }}>
                <div className="lightbox-ad-header">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Advertisement
                  </span>
                  <span className="lightbox-ad-timer">
                    Skip in {adCountdown}s
                  </span>
                </div>

                {/* Ad slot — Google AdSense will render here */}
                <div className="lightbox-ad-slot" id="prompt-ad-slot">
                  <div className="lightbox-ad-placeholder">
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📢</div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Ad Space</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Add your AdSense key in <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.35rem', borderRadius: '4px', fontSize: '0.72rem' }}>.env.local</code>
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/premium')}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1.2rem', gap: '0.4rem' }}
                  >
                    <Crown size={14} color="#FFD700" />
                    Go Premium — No Ads
                  </button>
                </div>
              </div>
            ) : (
              /* ── Prompt Display ── */
              <div className="glass-panel lightbox-prompt-panel" style={{ animation: 'scaleIn 0.25s ease both' }}>
                <div className="lightbox-prompt-header">
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{item.title || 'Prompt'}</h3>
                  {item.category && (
                    <span className="lightbox-prompt-badge">{item.category}</span>
                  )}
                </div>

                {/* Prompt text — clamped to 4 lines unless expanded */}
                <div
                  ref={promptRef}
                  className={`lightbox-prompt-text ${!expanded && isLongPrompt ? 'clamped' : ''}`}
                  onClick={() => { if (!isTyping && isLongPrompt) setExpanded(prev => !prev); }}
                  style={{ cursor: (!isTyping && isLongPrompt) ? 'pointer' : 'text' }}
                >
                  {renderTextWithLinks(displayedText)}
                  {isTyping && (
                    <span className="typing-indicator">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  )}
                </div>

                {/* Expand / Collapse toggle — only after typing finishes */}
                {!isTyping && isLongPrompt && (
                  <button
                    className="lightbox-expand-btn"
                    onClick={() => setExpanded(prev => !prev)}
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Show Less' : 'Show More'}
                  </button>
                )}

                {/* Copy button — only after typing finishes */}
                {!isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', animation: 'fadeIn 0.35s ease both' }}>
                    <button className="lightbox-copy-btn" onClick={handleCopy}>
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Lightbox;
