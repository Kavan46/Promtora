import { Play, Pencil, Trash2 } from 'lucide-react';

const MediaCard = ({ item, onClick, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="media-thumbnail" onClick={() => onClick(item)}>
      {item.type === 'video' ? (
        <div style={{ position: 'relative', height: '100%' }}>
          <video src={item.url} muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '0.75rem', display: 'flex' }}>
            <Play color="white" fill="white" size={20} />
          </div>
        </div>
      ) : item.type === 'guide' ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>📄 Guide</span>
        </div>
      ) : (
        <img src={item.url} alt={item.prompt || 'Image'} loading="lazy" />
      )}
      
      <div className="media-thumbnail-overlay" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{item.category}</span>
      </div>

      {isAdmin && (
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem', zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
          <button className="btn-icon" style={{ background: 'rgba(0,0,0,0.6)', padding: '0.4rem' }} onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
            <Pencil size={16} color="white" />
          </button>
          <button className="btn-icon" style={{ background: 'rgba(255,107,107,0.6)', padding: '0.4rem' }} onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
            <Trash2 size={16} color="white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaCard;
