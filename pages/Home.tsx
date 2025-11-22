
import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { VideoRow } from '../components/VideoRow';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { GeminiAssistant } from '../components/GeminiAssistant';
import { MOCK_VIDEOS } from '../constants';
import { Video } from '../types';
import { Calendar, Play } from 'lucide-react';
import { supabase } from '../services/supabase';

export const Home: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
        try {
            // Try to fetch from Supabase
            const { data, error } = await supabase.from('videos').select('*');
            
            if (error || !data || data.length === 0) {
                console.warn("Usando dados Mock (Supabase retornou vazio ou erro)");
                setVideos(MOCK_VIDEOS);
            } else {
                // Map Supabase data to our Video interface
                const mappedVideos: Video[] = data.map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    description: v.description,
                    thumbnailUrl: v.thumbnail_url,
                    videoUrl: v.video_url,
                    duration: v.duration || 'Unknown',
                    category: v.category,
                    isPremium: v.is_premium,
                    isNew: false
                }));
                setVideos(mappedVideos);
            }
        } catch (e) {
            console.error("Falha no fetch:", e);
            setVideos(MOCK_VIDEOS);
        } finally {
            setLoading(false);
        }
    };

    fetchVideos();
  }, []);
  
  // Categorize videos for rows
  const featured = videos.length > 0 ? videos[0] : MOCK_VIDEOS[0];
  const trending = videos;
  const continueWatching = videos.slice(0, 3); // Simple logic for now
  const kids = videos.filter(v => v.category === 'Infantil');
  const movies = videos.filter(v => v.category === 'Filmes');
  const studies = videos.filter(v => v.category === 'Estudos' || v.category === 'Histórias Bíblicas');
  
  // Daily Recommendation
  const dailyRec = videos.length > 2 ? videos[2] : featured; 

  if (loading) {
      return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500">Carregando a luz...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Navbar />
      
      <Hero featuredVideo={featured} onPlay={setSelectedVideo} />
      
      {/* Ajuste de margem negativa reduzida para não colar nos botões */}
      <div className="relative z-20 -mt-6 md:-mt-12 pl-0 md:pl-4 space-y-6">
        
        <VideoRow 
            title="Em Alta Hoje" 
            videos={trending} 
            onVideoClick={setSelectedVideo}
        />
        
        {/* RF007: Daily Recommendation Section */}
        <div className="px-4 md:px-8 py-4">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-full md:w-64 aspect-video flex-shrink-0 rounded-lg overflow-hidden group cursor-pointer" onClick={() => setSelectedVideo(dailyRec)}>
                    <img src={dailyRec.thumbnailUrl} alt={dailyRec.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-10 h-10 text-white fill-current" />
                    </div>
                </div>
                <div>
                    <div className="flex items-center space-x-2 text-amber-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Recomendação do Dia</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{dailyRec.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">Baseado no seu histórico de estudos bíblicos, separamos este conteúdo especial para sua edificação hoje.</p>
                    <button onClick={() => setSelectedVideo(dailyRec)} className="text-white text-sm font-medium hover:text-amber-400 underline">Assistir Agora</button>
                </div>
            </div>
        </div>

        {movies.length > 0 && (
            <VideoRow 
                title="Filmes Bíblicos" 
                videos={movies} 
                isLarge 
                onVideoClick={setSelectedVideo}
            />
        )}

        {kids.length > 0 && (
            <VideoRow 
                title="Lumen Kids" 
                videos={kids} 
                onVideoClick={setSelectedVideo}
            />
        )}

         {studies.length > 0 && (
            <VideoRow 
                title="Estudos e Histórias" 
                videos={studies} 
                onVideoClick={setSelectedVideo}
            />
        )}
        
      </div>

      <GeminiAssistant />
      
      <VideoPlayerModal 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
};
