// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  role: string;
  memberSince: string;
  modulesCompleted: number;
  totalModules: number;
  achievements: number;
}

// Module/Section types
export type ModuleStatus = 'completed' | 'active' | 'locked';

export interface Module {
  id: string;
  number: number;
  title: string;
  description?: string;
  status: ModuleStatus;
  duration: number; // in minutes
  xp: number;
  icon?: string;
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  totalXp: number;
  modules: Module[];
}

// Lesson types
export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  breadcrumbs: string[];
  duration: number;
  level: string;
  xp: number;
  content: LessonContent[];
}

export interface LessonContent {
  type: 'paragraph' | 'subtitle' | 'concept-box' | 'checklist';
  content: string | ChecklistItem[];
}

export interface ChecklistItem {
  title: string;
  description: string;
}

// Quiz types
export type QuestionType = 'choice' | 'cloze' | 'input';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  options: string[];
  correct: number;
}

export interface ClozeQuestion extends BaseQuestion {
  type: 'cloze';
  sentence: string;
  pool: string[];
  correct: string[];
}

export interface InputQuestion extends BaseQuestion {
  type: 'input';
  placeholder: string;
  correct: string;
}

export type Question = ChoiceQuestion | ClozeQuestion | InputQuestion;

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  xpEarned: number;
  streakBonus: number;
  badgeEarned?: string;
}

// Ranking types
export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  xp: number;
  streak: number;
  level: string;
  title: string;
}

export type RankingTab = 'xp' | 'streak';

// Stats types
export interface UserStats {
  level: number;
  streak: number;
  xp: number;
  xpToNextLevel: number;
  weeklyProgress: number;
}

// Navigation types
export type NavItem = 'learn' | 'sections' | 'ranking' | 'profile';
