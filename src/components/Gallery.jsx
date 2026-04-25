import MediaCard from './MediaCard';

const Gallery = ({ media, onMediaClick }) => {
  if (!media || media.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        <p>No media found.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="masonry-grid">
        {media.map((item) => (
          <MediaCard key={item.id} item={item} onClick={onMediaClick} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
