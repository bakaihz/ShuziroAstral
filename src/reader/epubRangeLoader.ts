import { ApiClient } from '../api/client';
import { getEnvironment } from '../config/environment';

export interface ChunkRange {
  start: number;
  end: number;
  data: Uint8Array;
}

export class EpubRangeLoader {
  private epubUrl: string;
  private totalSize: number = 0;
  private chunks: ChunkRange[] = [];
  private currentOffset: number = 0;
  private defaultChunkSize: number = 512 * 1024; // 512KB por chunk exemplo

  constructor(epubUrl: string) {
    this.epubUrl = epubUrl;
  }

  public getTotalSize(): number {
    return this.totalSize;
  }

  public getLoadedChunks(): ChunkRange[] {
    return [...this.chunks];
  }

  /**
   * Verifica se o intervalo desejado (start -> end) já está em cache
   */
  public hasRange(start: number, end: number): boolean {
    return this.chunks.some(chunk => chunk.start <= start && chunk.end >= end);
  }

  /**
   * Recupera um chunk do cache local se disponível
   */
  public getChunk(start: number, end: number): ChunkRange | null {
    const match = this.chunks.find(chunk => chunk.start <= start && chunk.end >= end);
    return match || null;
  }

  /**
   * Solicita um intervalo específico via HTTP Range Header (bytes=start-end)
   */
  public async loadRange(start: number, end: number): Promise<Uint8Array> {
    if (this.hasRange(start, end)) {
      const cached = this.getChunk(start, end);
      if (cached) {
        console.log(`[EpubRangeLoader] Cache Hit para range bytes=${start}-${end}`);
        return cached.data.slice(start - cached.start, end - cached.start + 1);
      }
    }

    const env = getEnvironment();
    console.log(`[EpubRangeLoader] Solicitando HTTP Range Request: bytes=${start}-${end} para ${this.epubUrl}`);

    if (env.mode === 'MOCK') {
      // Simulação dinâmica de resposta HTTP 206 Partial Content
      const rangeLength = end - start + 1;
      const fakeTotalSize = 5023191; // Exemplo de tamanho total descoberto dinamicamente
      this.totalSize = fakeTotalSize;

      const fakeBuffer = new Uint8Array(rangeLength);
      for (let i = 0; i < rangeLength; i++) {
        fakeBuffer[i] = (start + i) % 256;
      }

      const newChunk: ChunkRange = { start, end, data: fakeBuffer };
      this.chunks.push(newChunk);
      this.currentOffset = Math.max(this.currentOffset, end + 1);

      return fakeBuffer;
    }

    try {
      // Requisição REAL via proxy de CDN do EPUB
      const proxyUrl = `/api/leiasp/cdn-proxy?url=${encodeURIComponent(this.epubUrl)}`;
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Range': `bytes=${start}-${end}`
        }
      });

      if (response.status === 206 || response.status === 200) {
        const contentRange = response.headers.get('Content-Range');
        if (contentRange) {
          // Exemplo de header: bytes 2398115-3171639/5023191
          const parts = contentRange.split('/');
          if (parts[1]) {
            const parsedSize = parseInt(parts[1], 10);
            if (!isNaN(parsedSize)) {
              this.totalSize = parsedSize;
            }
          }
        }

        const buffer = await response.arrayBuffer();
        const chunkData = new Uint8Array(buffer);
        const actualEnd = start + chunkData.length - 1;

        const newChunk: ChunkRange = { start, end: actualEnd, data: chunkData };
        this.chunks.push(newChunk);
        this.currentOffset = Math.max(this.currentOffset, actualEnd + 1);

        return chunkData;
      } else {
        throw new Error(`Servidor respondeu com status ${response.status}`);
      }
    } catch (e: any) {
      console.warn(`[EpubRangeLoader] Falha ao solicitar range real, utilizando fallback parcial:`, e.message);
      // Fallback gracioso
      const rangeLength = Math.max(1, end - start + 1);
      const fallbackBuffer = new Uint8Array(rangeLength);
      return fallbackBuffer;
    }
  }

  /**
   * Solicita dinamicamente mais dados para a próxima seção conforme o usuário navega no livro
   */
  public async requestMoreData(bytesToFetch?: number): Promise<Uint8Array> {
    const start = this.currentOffset;
    const fetchSize = bytesToFetch || this.defaultChunkSize;
    const end = this.totalSize > 0 ? Math.min(start + fetchSize - 1, this.totalSize - 1) : start + fetchSize - 1;

    return await this.loadRange(start, end);
  }

  /**
   * Funde todos os chunks atualmente baixados em um único buffer continuo
   */
  public mergeChunks(): Uint8Array {
    if (this.chunks.length === 0) return new Uint8Array(0);

    const sorted = [...this.chunks].sort((a, b) => a.start - b.start);
    const totalBytes = sorted.reduce((acc, c) => acc + c.data.length, 0);
    const merged = new Uint8Array(totalBytes);

    let offset = 0;
    for (const chunk of sorted) {
      merged.set(chunk.data, offset);
      offset += chunk.data.length;
    }

    return merged;
  }
}
