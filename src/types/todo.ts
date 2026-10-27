export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EisenhowerQuadrant = 'DO_FIRST' | 'SCHEDULE' | 'DELEGATE' | 'DELETE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;       // ISO Date
  dueDate?: string;        // ISO Date
  isCompleted: boolean;
  
  // Fields managed by user or AI
  priority: PriorityLevel;
  quadrant?: EisenhowerQuadrant;
  estimatedMinutes?: number;
  tags: string[];
  subtasks: Subtask[];
  
  // Metadata from Gemini
  aiScore?: number;        // Task score 1-100 for sorting
  aiReasoning?: string;    // Explanation why this priority was assigned
}

export type ViewMode = 'list' | 'matrix';
export type FilterStatus = 'all' | 'active' | 'completed';
export type SortOption = 'aiScore' | 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface AISettings {
  apiKey: string;
  model: string;
  autoAnalyzeOnAdd: boolean;
}
