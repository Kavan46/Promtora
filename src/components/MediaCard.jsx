import { useState } from 'react';
import { Play, Pencil, Trash2, BookOpen } from 'lucide-react';

const MediaCard = ({ item, onClick, isAdmin, onEdit, onDelete }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="media-thumbnail" onClick={() => onClick(item)}>

      {/* ── Skeleton while image loads ── */}
      {item.type === 'image' && !imgLoaded && (
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      )}

      {/* ── Media content ── */}
      {item.type === 'video' ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <video
            src={item.url}
            muted
            loop
            playsInline
            onMouseOver={e => e.target.play()}
            onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
          />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            padding: '0.7rem',
            display: 'flex',
            transition: 'transform 0.2s ease, background 0.2s ease',
            pointerEvents: 'none',
          }}>
            <Play color="white" fill="white" size={20} />
          </div>
        </div>
      ) : (
        <img
          src={item.url}
          alt={item.title || item.prompt || 'Image'}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
        />
      )}

      {/* ── Hover overlay ── */}
      <div className="media-thumbnail-overlay">
        {item.title && (
          <p style={{ fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.2rem', lineHeight: 1.3 }}>
            {item.title}
          </p>
        )}
        {item.category && (
          <span style={{
            fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.05em',
            color: 'var(--accent-color)', textTransform: 'uppercase',
          }}>
            {item.category}
          </span>
        )}
      </div>

      {/* ── Admin edit/delete — admin only ── */}
      {isAdmin && (
        <div
          style={{
            position: 'absolute', top: '0.5rem', right: '0.5rem',
            display: 'flex', gap: '0.4rem', zIndex: 10,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="btn-icon"
            title="Edit"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: '0.35rem' }}
            onClick={e => { e.stopPropagation(); onEdit(item); }}
          >
            <Pencil size={14} color="white" />
          </button>
          <button
            className="btn-icon"
            title="Delete"
            style={{ background: 'rgba(220,38,38,0.65)', backdropFilter: 'blur(6px)', padding: '0.35rem' }}
            onClick={e => { e.stopPropagation(); onDelete(item); }}
          >
            <Trash2 size={14} color="white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaCard;
