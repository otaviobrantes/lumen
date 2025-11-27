
import React from 'react';
import { X, Lock, CreditCard } from 'lucide-react';
import { Video } from '../types';
import { Link } from 'react-router-dom';

interface VideoPlayerModalProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  // Função robusta para extrair o ID do YouTube de qualquer formato de link
  const getYouTubeEmbedUrl = (url: string) => {
      // Tenta pegar o ID de vários formatos:
      // - youtube.com/watch?v=ID
      // - youtube.com/embed/ID
      // - youtu.be/ID
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      const videoId = (match && match[2].length === 11) ? match[2] : null;

      if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
      }
      
      // Fallback: se já for um embed válido, retorna ele limpo, se não, tenta retornar original
      return url.includes('embed') ? url : url; 
  };

  // Detecção inteligente do tipo de vídeo
  const isYouTube = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(video.videoUrl) : video.videoUrl;
  
  // Check Auth & Subscription
  const userString = localStorage.getItem('lumen_user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Block if video is premium AND (user not logged in OR user inactive)
  // Exception: Admin always views
  const isLocked = video.isPremium && (user?.role !== 'ADMIN' && user?.subscription !== 'ACTIVE');

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-20 text-white/50 hover:text-white transition-colors bg-black/50 rounded-full p-2"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Player Container */}
      <div className="w-full max-w-6xl aspect-video bg-black relative shadow-2xl rounded-lg overflow-hidden border border-slate-800">
        
        {isLocked ? (
             // LOCKED SCREEN (Paywall)
             <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Blur */}
                <div className="absolute inset-0 opacity-20">
                    <img src={video.thumbnailUrl} className="w-full h-full object-cover blur-xl" alt="" />
                </div>
                
                <div className="relative z-10 text-center p-8 max-w-md bg-black/60 rounded-xl backdrop-blur-md border border-slate-700">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Conteúdo Exclusivo</h2>
                    <p className="text-gray-300 mb-6">Este vídeo é exclusivo para assinantes Premium. Atualize seu plano para liberar acesso a todo o catálogo.</p>
                    
                    <div className="space-y-3">
                        <Link to="/profile" onClick={onClose} className="block w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                            <CreditCard className="w-4 h-4 mr-2" /> Assinar Agora
                        </Link>
                        <button onClick={onClose} className="block w-full text-sm text-gray-400 hover:text-white transition-colors">
                            Voltar ao catálogo
                        </button>
                    </div>
                </div>
             </div>
        ) : (
            // UNLOCKED PLAYER (Real Playback)
            <>
                {isYouTube ? (
                    <iframe 
                        src={embedUrl}
                        title={video.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    // Native HTML5 Player for Supabase Uploads (MP4)
                    <video 
                        controls 
                        autoPlay 
                        className="w-full h-full bg-black"
                        poster={video.thumbnailUrl}
                    >
                        <source src={video.videoUrl} type="video/mp4" />
                        Seu navegador não suporta a reprodução deste vídeo.
                    </video>
                )}
            </>
        )}
      </div>
    </div>
  );
};
