import { ReadingAPI, ReadingMonitorPayload } from '../api/reading';

export class ReadingMonitor {
  private bookId: string | number;
  private active: boolean = false;
  private monitorInterval: any = null;

  constructor(bookId: string | number) {
    this.bookId = bookId;
  }

  public startMonitoring(intervalMs: number = 30000): void {
    if (this.active) return;
    this.active = true;

    // Monitoramento periódico secundário
    this.monitorInterval = setInterval(() => {
      this.sendMonitorUpdate();
    }, intervalMs);

    // Envio inicial
    this.sendMonitorUpdate();
  }

  public stopMonitoring(): void {
    this.active = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  public async sendMonitorUpdate(customPayload?: ReadingMonitorPayload): Promise<any> {
    const payloadToSend: ReadingMonitorPayload = customPayload || {
      bookId: this.bookId,
      timestamp: Date.now(),
      activeWindow: true
    };

    try {
      console.log(`[ReadingMonitor] Disparando monitoramento de leitura para o livro #${this.bookId}`);
      return await ReadingAPI.monitorRead(this.bookId, payloadToSend);
    } catch (e: any) {
      console.warn(`[ReadingMonitor] Erro ao enviar monitoramento:`, e.message);
    }
  }
}
