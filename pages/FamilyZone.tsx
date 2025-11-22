import React from 'react';
import { Navbar } from '../components/Navbar';
import { Download, Printer, Gamepad2, Palette } from 'lucide-react';
import { MOCK_ACTIVITIES } from '../constants';

export const FamilyZone: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <span className="inline-block p-3 rounded-full bg-amber-500/20 mb-4">
                <Gamepad2 className="w-8 h-8 text-amber-500" />
            </span>
            <h1 className="text-4xl font-extrabold text-white mb-2">Brincadeiras em Família</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Fortaleça a fé junto com seus filhos através da nossa coleção de jogos para imprimir, desenhos para colorir e quebra-cabeças.
            </p>
        </div>

        {/* Categories Filter (Mock) */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {['Todos', 'Colorir', 'Quebra-cabeças', 'Para Imprimir'].map((cat, idx) => (
                <button key={cat} className={`px-6 py-2 rounded-full font-medium transition-colors ${idx === 0 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}>
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
            {MOCK_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-amber-600/50 transition-all duration-300 hover:-translate-y-1 group">
                    <div className="relative aspect-[4/5] overflow-hidden">
                        <img src={activity.thumbnailUrl} alt={activity.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                activity.difficulty === 'Easy' ? 'bg-green-500/90 text-black' : 
                                activity.difficulty === 'Medium' ? 'bg-yellow-500/90 text-black' : 'bg-red-500/90 text-white'
                            }`}>
                                {activity.difficulty === 'Easy' ? 'Fácil' : activity.difficulty === 'Medium' ? 'Médio' : 'Difícil'}
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="bg-white text-slate-900 rounded-full p-3 font-bold flex items-center gap-2 hover:bg-amber-400 transition-colors">
                                <Download className="w-5 h-5" /> Baixar
                            </button>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-xs text-amber-500 font-medium uppercase tracking-wider">
                            {activity.type === 'COLORING' ? <Palette className="w-3 h-3" /> : <Printer className="w-3 h-3" />}
                            {activity.type === 'COLORING' ? 'Colorir' : activity.type === 'PUZZLE' ? 'Quebra-Cabeça' : activity.type === 'GAME' ? 'Jogo' : 'PDF'}
                        </div>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1">{activity.title}</h3>
                        <p className="text-sm text-gray-400">Arquivo PDF • Tamanho A4</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};