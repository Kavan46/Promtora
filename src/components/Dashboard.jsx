import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaCard from './MediaCard';
import { Upload, Search, X, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const DashboardSection = ({ title, media, onMediaClick, onUpload, isAdmin, onEdit, onDelete }) => (
  <div style={{ marginBottom: '3rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{title}</h2>
      {isAdmin && (
        <button onClick={() => onUpload(title.toLowerCase())} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          <Upload size={16} /> Upload
        </button>
      )}
    </div>
    
    {media.length === 0 ? (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No {title.toLowerCase()} found.
      </div>
    ) : (
      <div className="dashboard-grid">
        {media.map((item) => (
          <MediaCard 
            key={item.id} 
            item={item} 
            onClick={onMediaClick} 
            isAdmin={isAdmin} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    )}
  </div>
);

const Dashboard = ({ media, onMediaClick, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
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

  const handleUploadClick = (type) => {
    navigate('/admin', { state: { preselectType: type } });
  };

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      if (!isSupabaseConfigured()) {
        alert('Mock delete successful. Configure Supabase to persist changes.');
        if (onRefresh) onRefresh();
        return;
      }
      
      try {
        // Delete from database
        const { error: dbError } = await supabase.from('media').delete().eq('id', item.id);
        if (dbError) throw dbError;

        // Delete from storage if URL contains imdeo-media
        if (item.url.includes('imdeo-media')) {
          const path = item.url.split('/').pop();
          const { error: storageError } = await supabase.storage.from('imdeo-media').remove([path]);
          if (storageError) console.warn('Could not delete from storage:', storageError);
        }

        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete: ' + error.message);
      }
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        setIsSaving(false);
        setEditItem(null);
        alert('Mock save successful. Configure Supabase to persist changes.');
        if (onRefresh) onRefresh();
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase.from('media').update({
        title: editItem.title,
        prompt: editItem.prompt,
        category: editItem.category
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

  const filteredMedia = media.filter(item => 
    !search || 
    (item.prompt && item.prompt.toLowerCase().includes(search.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase())) ||
    (item.title && item.title.toLowerCase().includes(search.toLowerCase()))
  );

  const images = filteredMedia.filter(m => m.type === 'image');
  const videos = filteredMedia.filter(m => m.type === 'video');
  const guides = filteredMedia.filter(m => m.type === 'guide');

  return (
    <div className="container" style={{ padding: '2rem 1rem', position: 'relative' }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
        <input 
          type="text" 
          placeholder="Search titles, prompts, categories..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '3rem', margin: 0, borderRadius: '50px' }}
        />
      </div>

      <DashboardSection 
        title="Images" 
        media={images} 
        onMediaClick={onMediaClick} 
        onUpload={handleUploadClick}
        isAdmin={isAdmin}
        onEdit={setEditItem}
        onDelete={handleDelete}
      />
      
      <DashboardSection 
        title="Videos" 
        media={videos} 
        onMediaClick={onMediaClick} 
        onUpload={handleUploadClick}
        isAdmin={isAdmin}
        onEdit={setEditItem}
        onDelete={handleDelete}
      />

      <DashboardSection 
        title="Guides" 
        media={guides} 
        onMediaClick={onMediaClick} 
        onUpload={handleUploadClick}
        isAdmin={isAdmin}
        onEdit={setEditItem}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      {editItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button className="btn-icon" onClick={() => setEditItem(null)} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Media</h2>
            
            <form onSubmit={handleEditSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
                <input 
                  type="text" 
                  value={editItem.title || ''} 
                  onChange={e => setEditItem({...editItem, title: e.target.value})} 
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
                <select value={editItem.category || ''} onChange={e => setEditItem({...editItem, category: e.target.value})}>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Guide">Guide</option>
                  <option value="Nature">Nature</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Portrait">Portrait</option>
                </select>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Prompt</label>
                <textarea 
                  value={editItem.prompt || ''} 
                  onChange={e => setEditItem({...editItem, prompt: e.target.value})} 
                  rows={4}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSaving}>
                {isSaving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
