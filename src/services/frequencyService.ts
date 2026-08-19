import { 
  FrequenciaItem, 
  ResumoFaltasItem, 
  MotivoFaltaItem, 
  JustificativaFaltaItem, 
  FrequencyModel 
} from '../types';
import { normalizeFrequency } from './normalizers';

export class FrequencyService {
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
   * 1. GET /apiboletim/api/Frequencia/GetFaltasBimestreAtual
   */
  public async getCurrentAbsences(codigoAluno: string | number, token?: string): Promise<ResumoFaltasItem | null> {
    const cleanId = String(codigoAluno || '').trim();
    if (!cleanId) return null;

    try {
      const res = await fetch(`/api/frequencia/faltas-resumo?codigoAluno=${encodeURIComponent(cleanId)}`, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data ? (Array.isArray(json.data) ? json.data[0] : json.data) : (Array.isArray(json) ? json[0] : json);
      }
    } catch (e: any) {
      console.warn('[FrequencyService] getCurrentAbsences fallback:', e.message);
    }
    return null;
  }

  /**
   * 2. GET /apiboletim/api/Frequencia/ConsultaFrequenciaBimestre
   * Query frequency per term preserved in separate slots { 1: [...], 2: [...], 3: [...], 4: [...] }
   */
  public async getFrequencyByTerm(
    codigoAluno: string | number,
    anoLetivo: number = 2026,
    bimestre: number = 1,
    somenteAtivo: number = 0,
    token?: string
  ): Promise<FrequenciaItem[]> {
    const cleanId = String(codigoAluno || '').trim();
    if (!cleanId) return [];

    try {
      const url = `/api/frequencia/consulta?codigoAluno=${encodeURIComponent(cleanId)}&anoLetivo=${anoLetivo}&bimestre=${bimestre}&somenteAtivo=${somenteAtivo}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data || (Array.isArray(json) ? json : []);
      }
    } catch (e: any) {
      console.warn(`[FrequencyService] getFrequencyByTerm (Bim ${bimestre}) fallback:`, e.message);
    }
    return [];
  }

  /**
   * Fetches all 4 terms concurrently and preserves the term structure
   */
  public async getAllTermsFrequency(
    codigoAluno: string | number,
    anoLetivo: number = 2026,
    token?: string
  ): Promise<Record<number, FrequenciaItem[]>> {
    const results = await Promise.all([
      this.getFrequencyByTerm(codigoAluno, anoLetivo, 1, 0, token),
      this.getFrequencyByTerm(codigoAluno, anoLetivo, 2, 0, token),
      this.getFrequencyByTerm(codigoAluno, anoLetivo, 3, 0, token),
      this.getFrequencyByTerm(codigoAluno, anoLetivo, 4, 0, token)
    ]);

    return {
      1: results[0],
      2: results[1],
      3: results[2],
      4: results[3]
    };
  }

  /**
   * 3. GET /apiboletim/api/Frequencia/GetAlunoUltimosDiasFalta
   */
  public async getLastAbsenceDays(
    codigoAluno: string | number,
    anoLetivo: number = 2026,
    token?: string
  ): Promise<string[]> {
    const cleanId = String(codigoAluno || '').trim();
    if (!cleanId) return [];

    try {
      const res = await fetch(`/api/frequencia/ultimos-dias?codigoAluno=${encodeURIComponent(cleanId)}&anoLetivo=${anoLetivo}`, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json?.data || json;
        return Array.isArray(raw) ? raw.map((d: any) => typeof d === 'string' ? d : d.dataFalta || d.data || String(d)) : [];
      }
    } catch (e: any) {
      console.warn('[FrequencyService] getLastAbsenceDays fallback:', e.message);
    }
    return [];
  }

  /**
   * 4. GET /apiboletim/api/Frequencia/GetListaMotivoFaltaComCategoria
   */
  public async getAbsenceReasons(token?: string): Promise<MotivoFaltaItem[]> {
    try {
      const res = await fetch('/api/frequencia/motivos', {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data || (Array.isArray(json) ? json : []);
      }
    } catch (e: any) {
      console.warn('[FrequencyService] getAbsenceReasons fallback:', e.message);
    }
    return [];
  }

  /**
   * Consolidated full frequency pipeline
   */
  public async getFullFrequency(
    codigoAluno: string | number,
    anoLetivo: number = 2026,
    token?: string
  ): Promise<FrequencyModel> {
    const [resumo, termsFreq, lastDays, reasons] = await Promise.all([
      this.getCurrentAbsences(codigoAluno, token),
      this.getAllTermsFrequency(codigoAluno, anoLetivo, token),
      this.getLastAbsenceDays(codigoAluno, anoLetivo, token),
      this.getAbsenceReasons(token)
    ]);

    const allFreqList = [
      ...termsFreq[1],
      ...termsFreq[2],
      ...termsFreq[3],
      ...termsFreq[4]
    ];

    return normalizeFrequency(allFreqList, resumo, reasons, lastDays);
  }
}

export const frequencyService = new FrequencyService();
