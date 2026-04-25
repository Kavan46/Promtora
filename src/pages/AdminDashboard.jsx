import { useState, useEffect } from 'react';
import { Upload, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
const AdminDashboard = () => {
  const [file, setFile] = useState(null);
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
      setFile(e.target.files[0]);
    }
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
        // Mock upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessage({ text: 'Mock upload successful! (Configure Supabase for real uploads)', type: 'success' });
        setFile(null);
        setTitle('');
        setPrompt('');
        setCategory('');
        setIsUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to storage
      const { error: uploadError, data } = await supabase.storage
        .from('imdeo-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public url
      const { data: { publicUrl } } = supabase.storage
        .from('imdeo-media')
        .getPublicUrl(filePath);

      let type = file.type.startsWith('video/') ? 'video' : 'image';
      if (category.toLowerCase() === 'guide' || file.type === 'application/pdf') {
        type = 'guide';
      }

      // Insert record to database
      const { error: dbError } = await supabase.from('media').insert({
        url: publicUrl,
        title,
        prompt,
        category,
        type
      });

      if (dbError) throw dbError;

      setMessage({ text: 'Upload successful!', type: 'success' });
      setFile(null);
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

  if (checkingAuth) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-muted)' }}>You must be the admin to view this page.</p>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>Return to Gallery</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Admin Dashboard</h1>
      
      {!isSupabaseConfigured() && (
        <div style={{ padding: '1rem', background: 'rgba(255,179,0,0.1)', border: '1px solid var(--accent-color)', borderRadius: '8px', marginBottom: '2rem', color: 'var(--accent-color)' }}>
          <strong>Note:</strong> Supabase is not configured. Uploads will be simulated.
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Upload Media</h2>
        
        {message.text && (
          <div style={{ padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', backgroundColor: message.type === 'error' ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)', color: message.type === 'error' ? '#ff6b6b' : '#51cf66' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Media File (Image/Video)</label>
            <div style={{ 
              border: '2px dashed var(--border-color)', 
              padding: '2rem', 
              textAlign: 'center', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }} onClick={() => document.getElementById('file-upload').click()}>
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  {file.type.startsWith('video/') ? <FileVideo size={48} color="var(--accent-color)" /> : <ImageIcon size={48} color="var(--accent-color)" />}
                  <span>{file.name}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Upload size={48} />
                  <span>Click to select or drag and drop</span>
                </div>
              )}
              <input id="file-upload" type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this media"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="Guide">Guide</option>
              <option value="Nature">Nature</option>
              <option value="Cyberpunk">Cyberpunk</option>
              <option value="Portrait">Portrait</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Prompt Text</label>
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              rows={5} 
              placeholder="Enter the detailed prompt that generated this media..."
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isUploading}>
            {isUploading ? (
              <><Loader2 className="animate-spin" size={20} /> Uploading...</>
            ) : (
              <><Upload size={20} /> Upload to Gallery</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
