export interface ReaderState {
  bookId: string;
  page: number;
  pageCount: number;
  cfi: string;
  timeElapsed: number; // Segundos acumulados
  isComplete: boolean;
}

export const createInitialReaderState = (bookId: string | number, pageCount = 81): ReaderState => {
  return {
    bookId: String(bookId),
    page: 1,
    pageCount,
    cfi: `epubcfi(/6/2[chap01]!/4/2/1:0)`,
    timeElapsed: 0,
    isComplete: false
  };
};
