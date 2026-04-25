import { Link } from 'react-router-dom';
import { User, Image as ImageIcon } from 'lucide-react';

const Navbar = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem 2rem',
      backgroundColor: 'var(--bg-main)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <ImageIcon color="var(--accent-color)" size={32} />
        <span style={{ letterSpacing: '1px' }}>Im<span style={{ color: 'var(--accent-color)' }}>Deo</span></span>
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {categories && categories.length > 0 && categories.map(cat => (
          <button 
            key={cat}
            onClick={() => onSelectCategory(cat)}
            style={{
              color: selectedCategory === cat ? 'var(--accent-color)' : 'var(--text-muted)',
              fontWeight: selectedCategory === cat ? 'bold' : 'normal',
              transition: 'color 0.2s',
              fontSize: '1rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/auth" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
          <User size={24} />
          <span style={{ display: 'none', '@media(minWidth: 640px)': { display: 'inline' }}}>Account</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
