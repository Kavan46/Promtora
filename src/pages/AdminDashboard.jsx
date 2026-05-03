import { useState, useEffect } from 'react';
import { Upload, FileVideo, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseConfigured()) {
        setIsAdmin(true);
        setCheckingAuth(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else if (session.user.email !== 'kmatrixstudio@gmail.com') {
        setIsAdmin(false);
        setCheckingAuth(false);
      } else {
        setIsAdmin(true);
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);

      // Generate preview
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(selected);
      } else if (selected.type.startsWith('video/')) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (dropped.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(dropped);
      } else if (dropped.type.startsWith('video/')) {
        setPreview(URL.createObjectURL(dropped));
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !prompt || !category) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    setIsUploading(true);
    setMessage({ text: '', type: '' });

    try {
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessage({ text: 'Mock upload successful! (Configure Supabase for real uploads)', type: 'success' });
        clearFile();
        setTitle('');
        setPrompt('');
        setCategory('');
        setIsUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imdeo-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('imdeo-media')
        .getPublicUrl(filePath);

      let type = file.type.startsWith('video/') ? 'video' : 'image';
      if (category.toLowerCase() === 'guide' || file.type === 'application/pdf') {
        type = 'guide';
      }

      const { error: dbError } = await supabase.from('media').insert({
        url: publicUrl,
        title,
        prompt,
        category,
        type
      });

      if (dbError) throw dbError;

      setMessage({ text: 'Upload successful!', type: 'success' });
      clearFile();
      setTitle('');
      setPrompt('');
      setCategory('');
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'An error occurred during upload', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="container page-enter" style={{ padding: '4rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--accent-color)' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container page-enter" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', maxWidth: '480px', margin: '0 auto' }}>
          <AlertCircle size={48} color="#ff6b6b" style={{ margin: '0 auto 1rem auto' }} />
          <h1 style={{ color: '#ff6b6b', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Access Denied</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You must be the admin to view this page.</p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-enter" style={{ padding: '2rem 1rem', maxWidth: '700px' }}>
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem',
          transition: 'color 0.2s ease',
        }}
        onMouseOver={e => e.currentTarget.style.color = '#fff'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>
          <Upload size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--accent-hover)' }} />
          Upload Media
        </h2>
        
        {!isSupabaseConfigured() && (
          <div style={{
            padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem',
            background: 'rgba(255,179,0,0.08)', border: '1px solid rgba(255,179,0,0.25)',
            color: 'rgba(255,179,0,0.85)', fontSize: '0.85rem',
          }}>
            <strong>Note:</strong> Supabase is not configured. Uploads will be simulated.
          </div>
        )}

        {message.text && (
          <div style={{
            padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: message.type === 'error' ? 'rgba(255,0,0,0.08)' : 'rgba(0,255,0,0.08)',
            border: `1px solid ${message.type === 'error' ? 'rgba(255,107,107,0.3)' : 'rgba(77,255,77,0.3)'}`,
            color: message.type === 'error' ? '#ff6b6b' : '#51cf66',
            fontSize: '0.88rem',
            animation: 'slideUp 0.25s ease both',
          }}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpload}>
          {/* Category */}
          <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginBottom: '1.5rem' }}>
            <option value="">Select a category</option>
            <option value="Image">Image</option>
            <option value="Video">Video</option>
            <option value="Guide">Guide</option>
          </select>

          {/* Drop zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{ 
              border: '2px dashed var(--glass-border)', 
              padding: preview ? '0.75rem' : '2.5rem 2rem', 
              textAlign: 'center', 
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, background 0.2s ease',
              background: 'rgba(255,255,255,0.02)',
              marginBottom: '1.5rem',
              position: 'relative',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-hover)'; e.currentTarget.style.background = 'rgba(47,47,228,0.04)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            {preview ? (
              <div style={{ position: 'relative' }}>
                {file.type.startsWith('video/') ? (
                  <video src={preview} controls style={{ width: '100%', maxHeight: '220px', borderRadius: '10px', objectFit: 'contain' }} />
                ) : (
                  <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '220px', borderRadius: '10px', objectFit: 'contain' }} />
                )}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{file.name}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Upload size={40} strokeWidth={1.5} />
                <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                  {category === 'Guide' ? 'Upload cover image for Guide' : category === 'Video' ? 'Upload video file' : 'Drop file here or click to browse'}
                </span>
                <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>
                  {category === 'Guide' ? 'Supports images only' : category === 'Video' ? 'Supports videos only' : 'Supports images and videos'}
                </span>
              </div>
            )}
            <input 
              id="file-upload" 
              type="file" 
              accept={category === 'Guide' || category === 'Image' ? "image/*" : category === 'Video' ? "video/*" : "image/*,video/*"} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
          </div>

          {/* Title */}
          <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Title</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this media"
          />



          {/* Prompt */}
          <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Prompt Text</label>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            rows={5} 
            placeholder="Enter the detailed prompt that generated this media..."
          />

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', borderRadius: '50px', padding: '0.85rem' }} disabled={isUploading}>
            {isUploading ? (
              <><Loader2 className="animate-spin" size={18} /> Uploading…</>
            ) : (
              <><Upload size={18} /> Upload to Gallery</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
