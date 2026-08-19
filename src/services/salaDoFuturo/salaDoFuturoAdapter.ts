import { LearningProvider, LearningCourse, LearningActivity, LearningExercise, AnswerSubmissionPayload, AnswerSubmissionResult } from '../../types/learning';
import { salaDoFuturoTaskApi } from '../../api/tasks/taskApi';

export class SalaDoFuturoAdapter implements LearningProvider {
  public name = 'Sala do Futuro';
  private authToken: string = '';

  constructor(token: string = '') {
    this.authToken = token;
  }

  public setToken(token: string) {
    this.authToken = token;
  }

  public async getCourses(options?: any): Promise<LearningCourse[]> {
    const tasks = await salaDoFuturoTaskApi.listTasks({ token: this.authToken });
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      totalActivities: t.questionCount,
      completedActivities: (t.visualStatus === 'delivered' || t.visualStatus === 'graded') ? t.questionCount : 0,
      progressPercent: (t.visualStatus === 'delivered' || t.visualStatus === 'graded') ? 100 : 0
    }));
  }

  public async getActivities(courseId: string | number): Promise<LearningActivity[]> {
    const taskExec = await salaDoFuturoTaskApi.getTask(courseId, { token: this.authToken });
    return taskExec.questions.map((q, idx) => ({
      id: q.id,
      courseId,
      title: `Questão ${idx + 1}`,
      type: q.type === 'essay' ? 'task' : 'exercise',
      order: idx + 1,
      isCompleted: q.isAnswered
    }));
  }

  public async getExercise(exerciseId: string | number): Promise<LearningExercise | null> {
    return null;
  }

  public async submitAnswer(payload: AnswerSubmissionPayload): Promise<AnswerSubmissionResult> {
    const res = await salaDoFuturoTaskApi.submitTask({
      taskId: payload.exerciseId || payload.activityId || '',
      questions: [],
      answers: payload.selectedAlternativeId !== undefined ? { [payload.exerciseId]: payload.selectedAlternativeId } : {},
      essayText: payload.textAnswer,
      token: this.authToken
    });

    return {
      success: res.success,
      answerId: res.answerId,
      status: res.status,
      message: res.error
    };
  }

  public async getProgress(courseId?: string | number): Promise<{ completed: number; total: number; percentage: number }> {
    return { completed: 0, total: 0, percentage: 0 };
  }
}

export const salaDoFuturoAdapter = new SalaDoFuturoAdapter();
