import { ReaderState } from './readerState';
import { ReadingAPI, ReadingProgressPayload } from '../api/reading';

export class ProgressTracker {
  private state: ReaderState;
  private timerInterval: any = null;

  constructor(initialState: ReaderState) {
    this.state = { ...initialState };
  }

  public getState(): ReaderState {
    return { ...this.state };
  }

  public startTimer(): void {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      this.state.timeElapsed += 1;
    }, 1000);
  }

  public stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public async setPage(newPage: number): Promise<void> {
    const clampedPage = Math.max(1, Math.min(newPage, this.state.pageCount));
    this.state.page = clampedPage;
    this.state.cfi = `epubcfi(/6/${clampedPage * 2}[chap${clampedPage < 10 ? '0' + clampedPage : clampedPage}]!/4/2/1:0)`;
    this.state.isComplete = clampedPage >= this.state.pageCount;

    await this.sendProgress();
  }

  public async nextPage(): Promise<void> {
    if (this.state.page < this.state.pageCount) {
      await this.setPage(this.state.page + 1);
    }
  }

  public async prevPage(): Promise<void> {
    if (this.state.page > 1) {
      await this.setPage(this.state.page - 1);
    }
  }

  public async sendProgress(): Promise<any> {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    const tzOffset = now.getTimezoneOffset();

    const payload: ReadingProgressPayload = {
      CFI: this.state.cfi,
      BookId: String(this.state.bookId),
      TimeElapsed: Math.max(1, this.state.timeElapsed),
      ReadType: 'Read',
      Page: this.state.page,
      IsComplete: this.state.isComplete,
      ReadDate: formattedDate,
      PageCount: this.state.pageCount,
      TimezoneOffset: tzOffset
    };

    return await ReadingAPI.sendProgress(this.state.bookId, payload);
  }
}
