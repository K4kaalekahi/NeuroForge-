
import { Badge, Competition, LeaderboardEntry } from '../types';

export const badges: Badge[] = [
  {
    id: 'b-001',
    name: 'Synapse Spark',
    icon: 'Zap',
    description: 'Completed your first exercise.',
    color: 'text-yellow-400'
  },
  {
    id: 'b-002',
    name: 'Neural Networker',
    icon: 'Share2',
    description: 'Participated in a Co-op session.',
    color: 'text-purple-400'
  },
  {
    id: 'b-003',
    name: 'Deep Diver',
    icon: 'Anchor',
    description: 'Spent over 2 hours in deep focus.',
    color: 'text-blue-400'
  },
  {
    id: 'b-004',
    name: 'Streak Master',
    icon: 'Flame',
    description: 'Maintained a 7-day activity streak.',
    color: 'text-orange-500'
  }
];

export const competitions: Competition[] = [
  {
    id: 'comp-001',
    title: 'The Synapse Story',
    category: 'Writing',
    description: 'A creative writing challenge focusing on narrative flow and vocabulary retrieval. Write a 500-word story using only words with 2 or more syllables.',
    prize: 'Publication in "Mind & Matter" Journal',
    deadline: '2 days left',
    isPremium: true,
    participants: 124,
    imageGradient: 'from-yellow-600 to-red-600'
  },
  {
    id: 'comp-002',
    title: 'Visual Cortex Challenge',
    category: 'Design',
    description: 'Editorial design workshop. Re-imagine the interface of a daily tool using calming cognitive principles.',
    prize: 'Design Internship & Publication',
    deadline: '5 days left',
    isPremium: true,
    participants: 89,
    imageGradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'comp-003',
    title: 'Beyond the Void',
    category: 'Abstract',
    description: 'Abstract thought contest. Conceptualize a color that does not exist and describe its emotional weight.',
    prize: 'Publication in "Neuro Arts" Anthology',
    deadline: 'Ends tonight',
    isPremium: true,
    participants: 342,
    imageGradient: 'from-indigo-500 to-purple-800'
  },
  {
    id: 'comp-004',
    title: 'Hive Mind Innovation',
    category: 'Co-op',
    description: 'Solve a complex logic puzzle with a randomly assigned partner in real-time.',
    prize: 'Exclusive "Mastermind" Badge',
    deadline: 'Weekly',
    isPremium: false,
    participants: 1205,
    imageGradient: 'from-emerald-500 to-teal-700'
  }
];

export const leaderboardData: LeaderboardEntry[] = [
  { id: 'u-1', name: 'Alex Cortex', points: 15400, badges: 12, avatarSeed: 'alex', specialty: 'Craft-a-thon Master' },
  { id: 'u-2', name: 'Sarah Synapse', points: 14250, badges: 9, avatarSeed: 'sarah', specialty: 'Abstract Thinker' },
  { id: 'u-3', name: 'Logic Loop', points: 13800, badges: 15, avatarSeed: 'logic', specialty: 'Design Visionary' },
  { id: 'u-4', name: 'Neuro Navigator', points: 12100, badges: 8, avatarSeed: 'neuro', specialty: 'Speed Reader' },
  { id: 'u-5', name: 'Memory Lane', points: 11500, badges: 6, avatarSeed: 'memory', specialty: 'Strategist' },
];
