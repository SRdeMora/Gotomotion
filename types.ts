export enum UserRole {
  VOTER = 'VOTER',
  PARTICIPANT_INDIVIDUAL = 'PARTICIPANT_INDIVIDUAL',
  PARTICIPANT_TEAM = 'PARTICIPANT_TEAM'
}

export enum Category {
  BEST_VIDEO = 'Mejor Videoclip',
  BEST_DIRECTION = 'Mejor Dirección',
  BEST_PHOTOGRAPHY = 'Mejor Fotografía',
  BEST_ART = 'Mejor Arte',
  BEST_EDITING = 'Mejor Montaje',
  BEST_COLOR = 'Mejor Color'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  sector?: string; // For voters
  teamMembers?: string[]; // For teams
  socials?: {
    web?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string; // Embed URL
  authorId: string;
  authorName: string;
  categories: Category[];
  votes: number;
  views: number;
  materialsUsed?: string;
  description?: string;
  round: number;
  year: number;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: 'Dudas' | 'Técnica' | 'Promoción' | 'Normativa';
  authorName: string;
  replies: number;
  views: number;
  lastActivity: string;
}

export interface JuryMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}