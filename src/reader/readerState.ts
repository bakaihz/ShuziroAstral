export interface ReaderState {
  bookId: string | number;
  uid?: string;
  page: number;
  pageCount: number;
  cfi: string;
  timeElapsed: number; // Segundos acumulados
  isComplete: boolean;
  epubUrl: string;
}

export const createInitialReaderState = (
  bookId: string | number,
  pageCount = 81,
  epubUrl?: string,
  uid?: string
): ReaderState => {
  return {
    bookId,
    uid: uid || `user_std_${bookId}`,
    page: 1,
    pageCount,
    cfi: `epubcfi(/6/2[chap01]!/4/2/1:0)`,
    timeElapsed: 0,
    isComplete: false,
    epubUrl: epubUrl || `https://prod-us.elefanteletrado.com.br/cdn/Content/cdn/books/book_${bookId}.epub`
  };
};
