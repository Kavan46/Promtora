import { createClient } from '@supabase/supabase-js';

// These should be environment variables in a real app:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Only create a client if we have real-looking credentials to prevent errors during prototyping
export const supabase = supabaseUrl !== 'https://placeholder-project.supabase.co' 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Helper to check if Supabase is connected
export const isSupabaseConfigured = () => supabase !== null;

// Mock data for prototyping if Supabase is not configured
export const mockMedia = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    type: 'image',
    prompt: 'A stunning sunset over a rocky coastline, with vibrant orange and purple hues in the sky reflecting off the calm water. The waves gently crash against the shore.',
    category: 'Nature',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1682687982501-1e58f813fb31',
    type: 'image',
    prompt: 'A futuristic city skyline at night, illuminated by neon lights and flying cars weaving through towering skyscrapers. Cyberpunk aesthetic.',
    category: 'Cyberpunk',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538',
    type: 'image',
    prompt: 'A serene mountain lake reflecting the snow-capped peaks in the background. Pine trees surround the crystal-clear water.',
    category: 'Landscape',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1682687982185-531d09ec56fc',
    type: 'image',
    prompt: 'A close-up portrait of a cyberpunk character with glowing cybernetic implants and neon reflections in their eyes.',
    category: 'Portrait',
  },
];
