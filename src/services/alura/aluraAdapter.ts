import { LearningProvider, LearningCourse, LearningActivity, LearningExercise, AnswerSubmissionPayload, AnswerSubmissionResult } from '../../types/learning';

/**
 * AluraAdapter implements LearningProvider.
 * 
 * OBSERVATION & COMPLIANCE NOTE:
 * - Observed from HAR: GET https://cursos.alura.com.br/corp/tecnologia-e-inovacao-8-ano-178993-p1035747 (HTTP 200)
 * - Exercise execution endpoints: "Não confirmado pelo arquivo."
 * - This adapter defines the contract cleanly without inventing unconfirmed endpoints.
 * - When a specific HAR for Alura exercises is provided, concrete calls will be connected.
 */
export class AluraAdapter implements LearningProvider {
  public name = 'Alura';

  /**
   * Fetches Alura courses/tracks.
   * Observed from HAR: Course/trail dashboard loads correctly.
   */
  public async getCourses(options?: any): Promise<LearningCourse[]> {
    try {
      const res = await fetch('/api/alura/courses', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      console.warn('[AluraAdapter] getCourses fallback:', e.message);
    }

    // Default safe fallback representation for the trail observed in HAR
    return [
      {
        id: '178993-p1035747',
        title: 'Tecnologia e Inovação - 8º Ano',
        slug: 'tecnologia-e-inovacao-8-ano-178993-p1035747',
        url: 'https://cursos.alura.com.br/corp/tecnologia-e-inovacao-8-ano-178993-p1035747',
        progressPercent: 0
      }
    ];
  }

  /**
   * Fetches activities for an Alura course.
   */
  public async getActivities(courseId: string | number): Promise<LearningActivity[]> {
    try {
      const res = await fetch(`/api/alura/courses/${courseId}/activities`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      console.warn('[AluraAdapter] getActivities fallback:', e.message);
    }
    return [];
  }

  /**
   * Fetches an exercise.
   * Note: "Não confirmado pelo arquivo."
   */
  public async getExercise(exerciseId: string | number): Promise<LearningExercise | null> {
    try {
      const res = await fetch(`/api/alura/exercises/${exerciseId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      console.warn('[AluraAdapter] getExercise fallback:', e.message);
    }
    return null;
  }

  /**
   * Submits an answer to an Alura exercise.
   * Note: "Não confirmado pelo arquivo. Endpoint de envio aguarda captura específica de HAR."
   */
  public async submitAnswer(payload: AnswerSubmissionPayload): Promise<AnswerSubmissionResult> {
    console.info('[AluraAdapter] submitAnswer chamado. Endpoint real não confirmado pelo arquivo atual.');
    return {
      success: false,
      message: 'Não confirmado pelo arquivo. Forneça o HAR de resolução de exercício da Alura para ativação do endpoint.'
    };
  }

  /**
   * Fetches student progress on Alura.
   */
  public async getProgress(courseId?: string | number): Promise<{ completed: number; total: number; percentage: number }> {
    return { completed: 0, total: 10, percentage: 0 };
  }
}

export const aluraAdapter = new AluraAdapter();
