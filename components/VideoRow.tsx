import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { Video } from '../types';

interface VideoRowProps {
  title: string;
  videos: Video[];
  isLarge?: boolean;
  onVideoClick: (video: Video) => void;
}

export const VideoRow: React.FC<VideoRowProps> = ({ title, videos, isLarge = false, onVideoClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' ? -current.clientWidth / 1.5 : current.clientWidth / 1.5;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-6 px-4 md:px-8 group/row">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-100 mb-4 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-2">
        {title}
        <span className="text-xs text-amber-500 opacity-0 group-hover/row:opacity-100 transition-opacity font-normal">Ver tudo &gt;</span>
      </h2>
      
      <div className="relative group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-md"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div 
          ref={rowRef}
          className="flex space-x-4 overflow-x-scroll no-scrollbar py-2 px-2 scroll-smooth"
        >
          {videos.map((video) => (
            <div 
              key={video.id}
              onClick={() => onVideoClick(video)}
              className={`flex-none relative cursor-pointer transition-transform duration-300 ease-out hover:scale-105 z-0 hover:z-10 ${isLarge ? 'w-[200px] md:w-[300px]' : 'w-[160px] md:w-[240px]'}`}
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className={`w-full object-cover rounded-md shadow-md ${isLarge ? 'h-[300px] md:h-[450px]' : 'aspect-video'}`}
              />
              
              {/* Progress Bar overlay if applicable */}
              {video.progress && (
                <div className="absolute bottom-2 left-2 right-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${video.progress}%` }}
                  />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                 <PlayCircle className="w-12 h-12 text-white/90" />
              </div>

              <div className="mt-2 px-1">
                 <p className="text-sm font-medium text-gray-200 truncate">{video.title}</p>
                 {isLarge && <p className="text-xs text-gray-400 mt-1">{video.category}</p>}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-md"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};