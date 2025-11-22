
import { Video, Activity } from './types';

// Vídeos reais do YouTube (Embed links) com Capas do Unsplash (Para não quebrar)
export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'A História de Moisés',
    description: 'Siga a jornada épica de fé e libertação enquanto Moisés lidera os israelitas para fora do Egito rumo à Terra Prometida.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=2788&auto=format&fit=crop', // Mar Vermelho/Épico
    videoUrl: 'https://www.youtube.com/embed/adKk813m7Ts',
    duration: '23m',
    category: 'Histórias Bíblicas',
    isNew: true,
    isPremium: true,
  },
  {
    id: '2',
    title: 'Davi e Golias',
    description: 'Um jovem pastor enfrenta um guerreiro gigante armado apenas com uma funda e sua inabalável fé em Deus.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1535025639604-9a804c092faa?q=80&w=2000&auto=format&fit=crop', // Pedras de Rio / Natureza
    videoUrl: 'https://www.youtube.com/embed/7zL_vO7MvTI',
    duration: '25m',
    category: 'Infantil',
    progress: 45,
    isPremium: false, // Free content
  },
  {
    id: '3',
    title: 'O Nascimento de Jesus',
    description: 'A história do primeiro Natal. Maria, José e o milagre na manjedoura que mudou o mundo para sempre.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512641406448-6574e777bec6?q=80&w=2574&auto=format&fit=crop', // Estrela de Natal
    videoUrl: 'https://www.youtube.com/embed/QJg6JdaMhWw',
    duration: '27m',
    category: 'Filmes',
    isPremium: true,
  },
  {
    id: '4',
    title: 'Série: Atos dos Apóstolos',
    description: 'Uma animação visualmente rica explicando o livro de Atos e o início da Igreja Primitiva.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?q=80&w=2674&auto=format&fit=crop', // Pergaminhos/Escrita
    videoUrl: 'https://www.youtube.com/embed/K4O0s10_J1g',
    duration: '15m',
    category: 'Estudos',
    isPremium: true,
  },
  {
    id: '5',
    title: 'A Arca de Noé',
    description: 'A clássica história do dilúvio, a construção da arca e a promessa do arco-íris para a humanidade.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520052205864-92d242b3a76b?q=80&w=2000&auto=format&fit=crop', // Mar/Tempestade
    videoUrl: 'https://www.youtube.com/embed/wnqjU2N6d_s',
    duration: '22m',
    category: 'Infantil',
    isPremium: false,
  },
  {
    id: '6',
    title: 'Daniel na Cova dos Leões',
    description: 'Fé sob fogo: Daniel recusa-se a comprometer suas crenças e Deus fecha a boca dos leões.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=2586&auto=format&fit=crop', // Leão
    videoUrl: 'https://www.youtube.com/embed/T6_Y5r6YcKQ',
    duration: '25m',
    category: 'Histórias Bíblicas',
    progress: 10,
    isPremium: true,
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    title: 'Colorindo a Arca de Noé',
    type: 'COLORING',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2671&auto=format&fit=crop',
    downloadUrl: '#',
    difficulty: 'Easy'
  },
  {
    id: 'a2',
    title: 'Caça-Palavras: 12 Discípulos',
    type: 'PUZZLE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2600&auto=format&fit=crop',
    downloadUrl: '#',
    difficulty: 'Medium'
  },
  {
    id: 'a3',
    title: 'Monte o Templo de Salomão',
    type: 'PDF',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2568&auto=format&fit=crop', // Colunas de Pedra / Templo Clássico
    downloadUrl: '#',
    difficulty: 'Hard'
  },
  {
    id: 'a4',
    title: 'Cards de Trivia Bíblica',
    type: 'GAME',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2670&auto=format&fit=crop', // Cartas/Jogo
    downloadUrl: '#',
    difficulty: 'Medium'
  }
];

// Admin Stats Mock
export const ADMIN_STATS = {
    totalUsers: 1250,
    activeSubs: 980,
    totalViews: 45200,
    storageUsed: '450GB',
    recentUploads: [
        { id: 101, title: 'Sermão da Montanha (4K)', status: 'Processado', date: 'Hoje, 10:30' },
        { id: 102, title: 'Jonas e a Baleia', status: 'Processando', date: 'Hoje, 09:15' },
        { id: 103, title: 'Salmos Meditativos', status: 'Erro', date: 'Ontem, 18:45' },
    ]
};
