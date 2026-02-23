export type Language = 'EN' | 'TH' | 'JP';

export interface Set {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
}

export interface CharacterStats {
  level: number;
  exp: number;
  nextLevelExp: number;
  points: number;
  strength: number;
  agility: number;
  stamina: number;
  intelligence: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardExp: number;
  rewardPoints: number;
  isCompleted: boolean;
  type: 'daily' | 'weekly' | 'achievement';
}

export interface LandAnalysis {
  id: string;
  timestamp: string;
  location: string;
  soilType: string;
  structure: string;
  recommendation: string;
  manaDensity: string;
}

export interface TranslationSchema {
  title: string;
  dashboard: string;
  newWorkout: string;
  history: string;
  addExercise: string;
  addSet: string;
  weight: string;
  reps: string;
  save: string;
  cancel: string;
  delete: string;
  volume: string;
  maxWeight: string;
  noWorkouts: string;
  quickAdd: string;
  exerciseName: string;
  stats: string;
  login: string;
  register: string;
  logout: string;
  username: string;
  email: string;
  password: string;
  noAccount: string;
  haveAccount: string;
  welcome: string;
  quests: string;
  character: string;
  level: string;
  exp: string;
  strength: string;
  agility: string;
  stamina: string;
  intelligence: string;
  availablePoints: string;
  upgrade: string;
  dailyQuests: string;
  admin: string;
  createQuest: string;
  questTitle: string;
  questDesc: string;
  reward: string;
  landAnalysis: string;
  analyze: string;
  analyzing: string;
  location: string;
  soilType: string;
  structure: string;
  manaDensity: string;
  recommendation: string;
}
