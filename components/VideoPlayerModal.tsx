
import React from 'react';
import { X, Play, Pause, Volume2, Maximize, SkipForward, SkipBack, Lock, CreditCard } from 'lucide-react';
import { Video } from '../types';
import { Link } from 'react-router-dom';

interface VideoPlayerModalProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  const isEmbed = video.videoUrl.includes('embed');
  
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
      <div className="w-full max-w-6xl aspect-video bg-black relative shadow-2xl rounded-lg overflow-hidden">
        
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
            // UNLOCKED PLAYER
            <>
                {isEmbed ? (
                    <iframe 
                        src={`${video.videoUrl}?autoplay=1&rel=0&modestbranding=1`} 
                        title={video.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    // Fallback Player UI
                    <div className="w-full h-full bg-slate-900 relative group cursor-none hover:cursor-default overflow-hidden">
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-50" alt="Video Content" />
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h3 className="text-2xl text-white font-light">Simulando Stream: {video.title}</h3>
                        </div>

                        {/* Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-600 rounded-full mb-4 cursor-pointer group/progress">
                            <div className="w-1/3 h-full bg-amber-500 relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transform scale-0 group-hover/progress:scale-100 transition-all"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                            <button className="text-white hover:text-amber-400"><Play className="w-8 h-8 fill-current" /></button>
                            <button className="text-gray-300 hover:text-white"><SkipBack className="w-6 h-6" /> 10s</button>
                            <button className="text-gray-300 hover:text-white"><SkipForward className="w-6 h-6" /> 10s</button>
                            <div className="flex items-center space-x-2 text-gray-300 group/vol">
                                <Volume2 className="w-6 h-6" />
                                <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                                    <div className="h-1 bg-gray-500 rounded-full w-20 ml-2"><div className="w-3/4 h-full bg-white"></div></div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-300 font-mono">12:34 / {video.duration}</span>
                            </div>

                            <div>
                                <h4 className="text-white font-bold text-lg">{video.title}</h4>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button className="text-gray-300 hover:text-white font-semibold border border-gray-500 rounded px-2 py-0.5 text-xs uppercase">CC</button>
                                <button className="text-gray-300 hover:text-white"><Maximize className="w-6 h-6" /></button>
                            </div>
                        </div>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};
