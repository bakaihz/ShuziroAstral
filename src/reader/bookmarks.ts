import { BookmarkItem, BookmarksAPI } from '../api/bookmarks';

export class ReaderBookmarksManager {
  private bookmarks: BookmarkItem[] = [];

  public async loadBookmarks(bookId: string | number): Promise<BookmarkItem[]> {
    const res = await BookmarksAPI.getBookmarks(bookId);
    if (res.ok && res.data) {
      this.bookmarks = Array.isArray(res.data) ? res.data : [];
    }
    return this.bookmarks;
  }

  public getBookmarks(): BookmarkItem[] {
    return [...this.bookmarks];
  }

  public addBookmark(bookId: string | number, page: number, cfi: string): BookmarkItem {
    const newBm: BookmarkItem = {
      id: `bm_${Date.now()}`,
      bookId,
      page,
      cfi,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    this.bookmarks.push(newBm);
    return newBm;
  }
}
