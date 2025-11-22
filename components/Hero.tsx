import React from 'react';
import { Play, Info } from 'lucide-react';
import { Button } from './Button';
import { Video } from '../types';

interface HeroProps {
  featuredVideo: Video;
  onPlay: (video: Video) => void;
}

export const Hero: React.FC<HeroProps> = ({ featuredVideo, onPlay }) => {
  return (
    <div className="relative w-full h-[70vh] md:h-[85vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={featuredVideo.thumbnailUrl} 
          alt={featuredVideo.title} 
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay - Critical for the 'Netflix' look */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      </div>

      {/* Content - Z-Index increased to 30 to sit above the negative margin VideoRow */}
      <div className="relative z-30 h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-2xl">
           <div className="flex items-center space-x-2 mb-4">
                <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded">TOP 10 HOJE</span>
                <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Épico Bíblico</span>
           </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight leading-none">
            {featuredVideo.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3 drop-shadow-md">
            {featuredVideo.description}
          </p>
          <div className="flex space-x-4">
            <Button 
                variant="primary" 
                size="lg" 
                onClick={() => onPlay(featuredVideo)}
                className="text-black hover:bg-amber-400"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Assistir
            </Button>
            <Button variant="secondary" size="lg" className="bg-slate-500/40 backdrop-blur-sm hover:bg-slate-500/60">
              <Info className="w-5 h-5 mr-2" />
              Mais Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};