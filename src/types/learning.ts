// Learning Provider Abstract Interface
export interface LearningCourse {
  id: string | number;
  title: string;
  slug?: string;
  url?: string;
  category?: string;
  progressPercent?: number;
  totalActivities?: number;
  completedActivities?: number;
}

export interface LearningActivity {
  id: string | number;
  courseId?: string | number;
  title: string;
  type: 'exercise' | 'reading' | 'video' | 'task';
  order?: number;
  isCompleted?: boolean;
}

export interface LearningExercise {
  id: string | number;
  activityId?: string | number;
  statement: string;
  type: 'multiple_choice' | 'open' | 'essay';
  alternatives?: {
    id: string | number;
    text: string;
    value?: string | number;
  }[];
}

export interface AnswerSubmissionPayload {
  exerciseId: string | number;
  activityId?: string | number;
  courseId?: string | number;
  selectedAlternativeId?: string | number;
  textAnswer?: string;
  duration?: number;
  [key: string]: any;
}

export interface AnswerSubmissionResult {
  success: boolean;
  isCorrect?: boolean;
  score?: number;
  message?: string;
  answerId?: string | number;
  status?: string;
  raw?: any;
}

export interface LearningProvider {
  name: string;
  getCourses(options?: any): Promise<LearningCourse[]>;
  getActivities(courseId: string | number): Promise<LearningActivity[]>;
  getExercise(exerciseId: string | number): Promise<LearningExercise | null>;
  submitAnswer(payload: AnswerSubmissionPayload): Promise<AnswerSubmissionResult>;
  getProgress(courseId?: string | number): Promise<{ completed: number; total: number; percentage: number }>;
}
