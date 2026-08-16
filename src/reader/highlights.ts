import { HighlightItem, HighlightsAPI } from '../api/highlights';

export class ReaderHighlightsManager {
  private highlights: HighlightItem[] = [];

  public async loadHighlights(bookId: string | number): Promise<HighlightItem[]> {
    const res = await HighlightsAPI.getHighlights(bookId);
    if (res.ok && res.data) {
      this.highlights = Array.isArray(res.data) ? res.data : [];
    }
    return this.highlights;
  }

  public getHighlights(): HighlightItem[] {
    return [...this.highlights];
  }

  public addHighlight(bookId: string | number, text: string, cfi: string, color = 'yellow'): HighlightItem {
    const newHl: HighlightItem = {
      id: `hl_${Date.now()}`,
      bookId,
      cfi,
      text,
      color,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    this.highlights.push(newHl);
    return newHl;
  }
}
