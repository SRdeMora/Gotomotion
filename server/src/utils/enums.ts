/**
 * Utilidades para trabajar con enums que funcionan tanto con SQLite (strings) como PostgreSQL (enums)
 * 
 * En SQLite, los enums se almacenan como strings
 * En PostgreSQL, se usan enums nativos de Prisma
 */

// Valores válidos para roles (compatibles con ambos)
export const USER_ROLES = {
  VOTER: 'VOTER',
  PARTICIPANT_INDIVIDUAL: 'PARTICIPANT_INDIVIDUAL',
  PARTICIPANT_TEAM: 'PARTICIPANT_TEAM',
} as const;

// Valores válidos para categorías
export const CATEGORIES = {
  BEST_VIDEO: 'BEST_VIDEO',
  BEST_DIRECTION: 'BEST_DIRECTION',
  BEST_PHOTOGRAPHY: 'BEST_PHOTOGRAPHY',
  BEST_ART: 'BEST_ART',
  BEST_EDITING: 'BEST_EDITING',
  BEST_COLOR: 'BEST_COLOR',
} as const;

// Valores válidos para categorías del foro
export const FORUM_CATEGORIES = {
  GENERAL: 'GENERAL',
  TECNICA: 'TECNICA',
  PROMOCION: 'PROMOCION',
  NORMATIVA: 'NORMATIVA',
  SHOWCASE: 'SHOWCASE',
} as const;

// Helper para verificar si un string es un rol válido
export const isValidRole = (role: string): boolean => {
  return Object.values(USER_ROLES).includes(role as any);
};

// Helper para verificar si un string es una categoría válida
export const isValidCategory = (category: string): boolean => {
  return Object.values(CATEGORIES).includes(category as any);
};

// Helper para verificar si un string es una categoría de foro válida
export const isValidForumCategory = (category: string): boolean => {
  return Object.values(FORUM_CATEGORIES).includes(category as any);
};

// Helper para obtener todos los valores de categorías
export const getAllCategories = (): string[] => {
  return Object.values(CATEGORIES);
};

// Helper para verificar si es categoría de equipo
export const isTeamCategory = (category: string): boolean => {
  return category === CATEGORIES.BEST_VIDEO;
};

// Helper para obtener roles de participantes
export const getParticipantRoles = (): string[] => {
  return [USER_ROLES.PARTICIPANT_INDIVIDUAL, USER_ROLES.PARTICIPANT_TEAM];
};

