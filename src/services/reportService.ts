import { BoletimItem, FechamentoItem, ReportCardModel } from '../types';
import { disciplineService } from './disciplineService';
import { frequencyService } from './frequencyService';
import { normalizeReport } from './normalizers';

export class ReportService {
  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * 1. GET /apiboletim/api/Boletim/GetBoletimCompleto
   */
  public async getCompleteReport(
    codigoAluno: string | number,
    anoLetivo: number = 2026,
    codigoTurma: number | string = 0,
    token?: string
  ): Promise<BoletimItem[]> {
    const cleanId = String(codigoAluno || '').trim();
    if (!cleanId) return [];

    try {
      const url = `/api/boletim?codigoAluno=${encodeURIComponent(cleanId)}&anoLetivo=${anoLetivo}&codigoTurma=${codigoTurma}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data || (Array.isArray(json) ? json : []);
      }
    } catch (e: any) {
      console.warn('[ReportService] getCompleteReport fallback:', e.message);
    }
    return [];
  }

  /**
   * 2. GET /apiboletim/api/Fechamento/ConsultaFechamentoComparativo
   * Closure types: 5, 6, 7, 8, 10
   */
  public async getClosing(
    anoLetivo: number = 2026,
    tipoFechamento: number = 5,
    codigoDisciplina?: number,
    token?: string
  ): Promise<FechamentoItem[]> {
    try {
      let url = `/api/fechamento?anoLetivo=${anoLetivo}&tipoFechamento=${tipoFechamento}`;
      if (codigoDisciplina) {
        url += `&codigoDisciplina=${codigoDisciplina}`;
      }
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data || (Array.isArray(json) ? json : []);
      }
    } catch (e: any) {
      console.warn(`[ReportService] getClosing (Tipo ${tipoFechamento}) fallback:`, e.message);
    }
    return [];
  }

  /**
   * Combines disciplines, boletim completo, frequency per term and closings into a unified ReportCardModel
   * Includes independent fallback states for sub-services.
   */
  public async getStructuredReportCard(
    codigoAluno: string | number,
    anoLetivo: number = 2026,
    codigoTurma: number | string = 0,
    token?: string
  ): Promise<{
    reportCard: ReportCardModel;
    sources: {
      disciplinesOk: boolean;
      boletimOk: boolean;
      frequencyOk: boolean;
      closingOk: boolean;
    };
  }> {
    const sources = {
      disciplinesOk: false,
      boletimOk: false,
      frequencyOk: false,
      closingOk: false
    };

    // Parallel retrieval of primary sources
    const [disciplinesRes, boletimRes, freqRes, closingsRes] = await Promise.allSettled([
      disciplineService.getStudentDisciplines(codigoAluno, token),
      this.getCompleteReport(codigoAluno, anoLetivo, codigoTurma, token),
      frequencyService.getAllTermsFrequency(codigoAluno, anoLetivo, token),
      this.getClosing(anoLetivo, 5, undefined, token)
    ]);

    const rawDisciplines = disciplinesRes.status === 'fulfilled' ? disciplinesRes.value : [];
    if (disciplinesRes.status === 'fulfilled' && rawDisciplines.length > 0) sources.disciplinesOk = true;

    const rawBoletim = boletimRes.status === 'fulfilled' ? boletimRes.value : [];
    if (boletimRes.status === 'fulfilled' && rawBoletim.length > 0) sources.boletimOk = true;

    const rawFreqByTerm = freqRes.status === 'fulfilled' ? freqRes.value : { 1: [], 2: [], 3: [], 4: [] };
    if (freqRes.status === 'fulfilled') sources.frequencyOk = true;

    const rawClosings = closingsRes.status === 'fulfilled' ? closingsRes.value : [];
    if (closingsRes.status === 'fulfilled' && rawClosings.length > 0) sources.closingOk = true;

    const reportCard = normalizeReport(rawDisciplines, rawBoletim, rawFreqByTerm, rawClosings);

    return {
      reportCard,
      sources
    };
  }
}

export const reportService = new ReportService();
