import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Lightbox from './components/Lightbox';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import History from './pages/History';
import Premium from './pages/Premium';
import { supabase, isSupabaseConfigured, mockMedia } from './lib/supabaseClient';

function App() {
  const [media, setMedia] = useState([]);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    if (!isSupabaseConfigured()) {
      setMedia(mockMedia);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <Sidebar>
          <Routes>
            <Route path="/" element={<Dashboard media={media} onMediaClick={setLightboxItem} onRefresh={fetchMedia} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </Sidebar>

        {lightboxItem && (
          <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
        )}
      </div>
    </Router>
  );
}

export default App;
