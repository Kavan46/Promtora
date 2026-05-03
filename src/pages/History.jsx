import { useState, useEffect } from 'react';
import { Clock, Eye, Trash2, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load viewing history from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('promptora_history') || '[]');
      setHistory(stored);
    } catch {
      setHistory([]);
    }
    setLoading(false);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('promptora_history');
    setHistory([]);
  };

  const removeItem = (index) => {
    const updated = history.filter((_, i) => i !== index);
    localStorage.setItem('promptora_history', JSON.stringify(updated));
    setHistory(updated);
  };

  if (loading) {
    return (
      <div className="container page-enter" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="container page-enter" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={22} color="var(--accent-hover)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Viewing History</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                fontSize: '0.78rem', fontWeight: 600, color: '#ff6b6b',
                padding: '0.35rem 0.75rem', borderRadius: '6px',
                transition: 'background 0.2s ease',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: 'var(--text-muted)',
          }}>
            <Eye size={40} strokeWidth={1.2} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>No viewing history yet</p>
            <p style={{ fontSize: '0.82rem', opacity: 0.7, marginTop: '0.25rem' }}>
              Media you view will appear here.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
              style={{ marginTop: '1.25rem', fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}
            >
              Browse Gallery
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {history.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                animation: `slideUp 0.3s ease ${i * 0.04}s both`,
                transition: 'background 0.2s ease',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '52px', height: '36px', borderRadius: '8px', overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)', flexShrink: 0,
                }}>
                  {item.url && (
                    <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title || 'Untitled'}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {item.category || 'Media'} · {item.viewedAt ? new Date(item.viewedAt).toLocaleDateString() : ''}
                  </p>
                </div>

                {/* Remove */}
                <button
                  className="btn-icon"
                  onClick={() => removeItem(i)}
                  title="Remove"
                  style={{ padding: '0.3rem' }}
                >
                  <Trash2 size={14} color="var(--text-muted)" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
