import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaCard from './MediaCard';
import { Plus, Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/* ─── Scrollable Section ────────────────────────────── */
const DashboardSection = ({ title, media, onMediaClick, isAdmin, onEdit, onDelete }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [media]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.media-thumbnail')?.offsetWidth || 220;
    el.scrollBy({ left: dir * (cardWidth + 16) * 2, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-section" style={{ marginBottom: '2.5rem' }}>
      {/* Section header */}
      <div className="section-divider">
        <h2>{title}</h2>
        <span className="section-count">{media.length}</span>
      </div>

      {media.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.92rem' }}
        >
          No {title.toLowerCase()} found yet.
        </div>
      ) : (
        <div className="scroll-section-wrap">
          {/* Left arrow */}
          {canScrollLeft && (
            <button className="scroll-arrow scroll-arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left">
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Scrollable row */}
          <div className="scroll-row" ref={scrollRef}>
            {media.map((item, idx) => (
              <div className="scroll-card" key={item.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                <MediaCard
                  item={item}
                  onClick={onMediaClick}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button className="scroll-arrow scroll-arrow-right" onClick={() => scroll(1)} aria-label="Scroll right">
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Dashboard ─────────────────────────────────────── */
const Dashboard = ({ media, onMediaClick, onRefresh }) => {
  const [search, setSearch]     = useState('');
  const [isAdmin, setIsAdmin]   = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

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

  /* ── Delete ── */
  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    if (!isSupabaseConfigured()) {
      alert('Mock delete successful. Configure Supabase to persist changes.');
      if (onRefresh) onRefresh();
      return;
    }

    try {
      const { error: dbError } = await supabase.from('media').delete().eq('id', item.id);
      if (dbError) throw dbError;

      if (item.url && item.url.includes('imdeo-media')) {
        const path = item.url.split('/').pop();
        await supabase.storage.from('imdeo-media').remove([path]);
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  /* ── Edit save ── */
  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        setIsSaving(false);
        setEditItem(null);
        alert('Mock save successful.');
        if (onRefresh) onRefresh();
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.from('media').update({
        title:    editItem.title,
        prompt:   editItem.prompt,
        category: editItem.category,
      }).eq('id', editItem.id);

      if (error) throw error;
      setEditItem(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to update: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Filter ── */
  const q = search.toLowerCase();
  const filteredMedia = media.filter(item =>
    !q ||
    (item.prompt   && item.prompt.toLowerCase().includes(q))   ||
    (item.category && item.category.toLowerCase().includes(q)) ||
    (item.title    && item.title.toLowerCase().includes(q))
  );

  const images = filteredMedia.filter(m => m.type === 'image');
  const videos = filteredMedia.filter(m => m.type === 'video');
  const guides = filteredMedia.filter(m => m.type === 'guide');

  return (
    <div className="container page-enter" style={{ padding: '2rem 1.5rem', position: 'relative' }}>

      {/* ── Search ── */}
      <div className="search-bar-wrap">
        <Search
          size={18}
          style={{
            position: 'absolute', left: '1.15rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search titles, prompts, categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <button
            className="btn-icon"
            onClick={() => setSearch('')}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Sections ── */}
      <DashboardSection title="Images" media={images} onMediaClick={onMediaClick} isAdmin={isAdmin} onEdit={setEditItem} onDelete={handleDelete} />
      <DashboardSection title="Videos" media={videos} onMediaClick={onMediaClick} isAdmin={isAdmin} onEdit={setEditItem} onDelete={handleDelete} />
      <DashboardSection title="Guides" media={guides} onMediaClick={onMediaClick} isAdmin={isAdmin} onEdit={setEditItem} onDelete={handleDelete} />

      {/* ── Floating + button — ADMIN ONLY ── */}
      {isAdmin && (
        <button
          className="fab"
          onClick={() => navigate('/admin')}
          aria-label="Upload new media"
        >
          <span className="fab-tooltip">Upload Media</span>
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
        <div
          className="lightbox-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null); }}
        >
          <div
            className="glass-panel"
            style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative', animation: 'scaleIn 0.25s ease both' }}
          >
            <button
              className="btn-icon"
              onClick={() => setEditItem(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            >
              <X size={22} />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Edit Media</h2>

            <form onSubmit={handleEditSave}>
              <div style={{ marginBottom: '0.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Title</label>
                <input type="text" value={editItem.title || ''} onChange={e => setEditItem({ ...editItem, title: e.target.value })} />
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
                <select value={editItem.category || ''} onChange={e => setEditItem({ ...editItem, category: e.target.value })}>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Guide">Guide</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Prompt</label>
                <textarea value={editItem.prompt || ''} onChange={e => setEditItem({ ...editItem, prompt: e.target.value })} rows={4} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSaving}>
                {isSaving ? <><Loader2 className="animate-spin" size={17} /> Saving…</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
