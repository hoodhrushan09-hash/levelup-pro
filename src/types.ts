export type Category = 'study' | 'health' | 'coding' | 'personal' | 'other';
export type Priority = 'low' | 'medium' | 'high';
export type Mood = 'happy' | 'neutral' | 'sad';
export type Frequency = 'daily' | 'weekly';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
  avatar?: {
    bodyType: 'slim' | 'buff' | 'normal' | 'athletic' | 'curvy' | 'tall' | 'short';
    outfit: 'warrior' | 'mage' | 'rogue' | 'casual' | 'noble' | 'scholar' | 'explorer' | 'assassin' | 'knight' | 'monk' | 'merchant';
    color: string;
    hairColor: string;
    hairStyle: 'short' | 'long' | 'spiky' | 'bald' | 'ponytail' | 'mohawk' | 'braids' | 'curly' | 'undercut';
    accessory?: 'none' | 'glasses' | 'scarf' | 'crown' | 'eyepatch' | 'cape';
  };
  stats: {
    tasksCompleted: number;
    habitsMaintained: number;
    totalXP: number;
    lastDailyQuestCompleted?: string; // ISO Date
  };
  settings?: {
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    sfxEnabled: boolean;
  };
  dailyQuest?: DailyQuest;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  uid: string;
  title: string;
  category: Category;
  priority: Priority;
  deadline?: string;
  reminderTime?: string; // ISO string
  completed: boolean;
  xpReward: number;
  createdAt: string;
  subtasks?: Subtask[];
}

export interface Habit {
  id: string;
  uid: string;
  title: string;
  frequency: Frequency;
  streak: number;
  strength: number; // 0-100
  lastCompleted?: string;
  xpReward: number;
  history?: string[]; // Array of ISO dates
}

export interface Skill {
  id: string;
  uid: string;
  name: string;
  level: number;
  xp: number;
  parentId?: string;
  description?: string;
  icon?: string;
  unlocked: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  date: string; // ISO Date
}

export interface JournalEntry {
  id: string;
  uid: string;
  content: string;
  mood: Mood;
  date: string;
}

export interface FocusSession {
  id: string;
  uid: string;
  duration: number; // in minutes
  type: 'work' | 'short-break' | 'long-break';
  startTime: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  uid: string;
  type: 'tasks' | 'habits' | 'level' | 'focus' | 'skills' | 'habit_strength' | 'task_streak';
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  requirement: number;
}
