
export enum CognitiveDomain {
  LINGUISTIC = 'Linguistic',
  LOGICAL = 'Logical',
  SPATIAL = 'Spatial',
  KINESTHETIC = 'Kinesthetic',
  INTERPERSONAL = 'Interpersonal',
  INTRAPERSONAL = 'Intrapersonal',
  EXISTENTIAL = 'Existential',
}

export enum DifficultyTier {
  TIER_1 = 'Foundational',
  TIER_2 = 'Intermediate',
  TIER_3 = 'Advanced',
  TIER_4 = 'Mastery',
}

export interface Slide {
  id: string;
  text: string;
  visualPrompt?: string; // Prompt for dynamic image generation
  isInteractive?: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  domain: CognitiveDomain;
  tier: DifficultyTier;
  duration: number; // minutes
  description: string;
  thumbnailVisualPrompt?: string; // For generating the exercise card/cover
  publicationPrize?: string; // Admin-only field for competition context
  benefits: string[];
  script: Slide[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  description: string;
  color: string;
}

export interface UserProgress {
    exerciseId: string;
    slideIndex: number;
    timestamp: number;
}

export interface UserProfile {
  name: string;
  learningStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing';
  completedExercises: string[];
  points: number;
  streak: number;
  isPremium: boolean;
  badges: string[]; // IDs of earned badges
  currentProgress?: UserProgress | null; // Track interrupted session
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Competition {
  id: string;
  title: string;
  category: 'Writing' | 'Design' | 'Abstract' | 'Co-op';
  description: string;
  prize: string;
  deadline: string;
  isPremium: boolean;
  participants: number;
  imageGradient: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  badges: number;
  avatarSeed: string;
  specialty: string;
}