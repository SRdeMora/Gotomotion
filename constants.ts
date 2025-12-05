import { Category, JuryMember, Video, ForumTopic } from './types';

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    thumbnail: 'https://picsum.photos/800/450?random=1',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    authorId: 'u1',
    authorName: 'Studio Alpha',
    categories: [Category.BEST_VIDEO, Category.BEST_COLOR],
    votes: 1240,
    views: 5300,
    materialsUsed: 'Arri Alexa, DaVinci Resolve',
    round: 1,
    year: 2024
  },
  {
    id: '2',
    title: 'Silent Echoes',
    thumbnail: 'https://picsum.photos/800/450?random=2',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    authorId: 'u2',
    authorName: 'Maria González',
    categories: [Category.BEST_DIRECTION, Category.BEST_PHOTOGRAPHY],
    votes: 980,
    views: 3200,
    materialsUsed: 'Sony A7SIII, Premiere Pro',
    round: 1,
    year: 2024
  },
  {
    id: '3',
    title: 'Urban Flow',
    thumbnail: 'https://picsum.photos/800/450?random=3',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    authorId: 'u3',
    authorName: 'Team Rocket',
    categories: [Category.BEST_EDITING, Category.BEST_ART],
    votes: 850,
    views: 2100,
    materialsUsed: 'Red Komodo, After Effects',
    round: 1,
    year: 2024
  },
  {
    id: '4',
    title: 'Abstract Mind',
    thumbnail: 'https://picsum.photos/800/450?random=4',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    authorId: 'u4',
    authorName: 'John Doe',
    categories: [Category.BEST_ART],
    votes: 600,
    views: 1500,
    materialsUsed: 'Blender, Cinema 4D',
    round: 1,
    year: 2024
  },
];

export const MOCK_JURY: JuryMember[] = [
  {
    id: 'j1',
    name: 'Sofia Coppola',
    role: 'Directora de Cine',
    image: 'https://picsum.photos/200/200?random=10',
    bio: 'Galardonada directora conocida por su estética visual única.'
  },
  {
    id: 'j2',
    name: 'Roger Deakins',
    role: 'Director de Fotografía',
    image: 'https://picsum.photos/200/200?random=11',
    bio: 'Leyenda de la cinematografía con múltiples premios Oscar.'
  },
  {
    id: 'j3',
    name: 'Hans Zimmer',
    role: 'Compositor',
    image: 'https://picsum.photos/200/200?random=12',
    bio: 'Compositor de bandas sonoras icónicas para cine.'
  }
];

export const MOCK_TOPICS: ForumTopic[] = [
  {
    id: 't1',
    title: '¿Cuál es la mejor configuración de ISO para nocturnas?',
    category: 'Técnica',
    authorName: 'Carlos Ruiz',
    replies: 15,
    views: 340,
    lastActivity: '2h'
  },
  {
    id: 't2',
    title: 'Estrategias para promocionar tu videoclip en Instagram',
    category: 'Promoción',
    authorName: 'Ana V.',
    replies: 42,
    views: 1200,
    lastActivity: '5m'
  },
  {
    id: 't3',
    title: 'Duda sobre las bases legales: Música con copyright',
    category: 'Normativa',
    authorName: 'Studio X',
    replies: 8,
    views: 150,
    lastActivity: '1d'
  }
];