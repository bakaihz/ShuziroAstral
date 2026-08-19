export interface InternalAlternative {
  id: string | number;
  text: string;
  value?: string | number;
}

export interface InternalQuestion {
  id: string | number;
  order?: number;
  statement: string;
  type: 'multiple_choice' | 'essay' | 'open';
  alternatives: InternalAlternative[];
  selectedAlternativeId?: string | number;
  textAnswer?: string;
  isAnswered: boolean;
}

export interface InternalTaskExecution {
  taskId: string | number;
  answerId?: string | number | null;
  title: string;
  status: 'not_started' | 'in_progress' | 'draft' | 'submitted' | 'finished' | 'graded';
  questions: InternalQuestion[];
  durationSeconds: number;
  roomName?: string;
  tokenCode?: string | null;
  captchaToken?: string | null;
  raw?: any;
}
