import { aluraAdapter } from '../../services/alura/aluraAdapter';
import { LearningCourse, LearningActivity, LearningExercise } from '../../types/learning';

export class AluraApi {
  public async getCourses(): Promise<LearningCourse[]> {
    return await aluraAdapter.getCourses();
  }

  public async getActivity(courseId: string | number): Promise<LearningActivity[]> {
    return await aluraAdapter.getActivities(courseId);
  }

  public async getExercise(exerciseId: string | number): Promise<LearningExercise | null> {
    return await aluraAdapter.getExercise(exerciseId);
  }

  public async submitExercise(payload: any): Promise<any> {
    return await aluraAdapter.submitAnswer(payload);
  }

  public async getProgress(courseId?: string | number): Promise<any> {
    return await aluraAdapter.getProgress(courseId);
  }
}

export const aluraApi = new AluraApi();
