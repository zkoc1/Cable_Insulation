import type { CableTypeCategory } from '../core/interfaces/cable';

export interface Formula {
  id: string;
  label: string;
  expression: string;
  standard?: string;
}

export const DEFAULT_FORMULAS: Record<string, Formula[]> = {
  XLPE_HV: [
    { id:'x1', label:'tmin (XLPE min kalınlık)',       expression:'tmin = min(t₁,…,t₆)', standard:'TS EN 60811-201' },
    { id:'x2', label:'tmax (XLPE max kalınlık)',       expression:'tmax = max(t₁,…,t₆)', standard:'TS EN 60811-201' },
    { id:'x3', label:'tmin_iç (iç yarı iletken)',      expression:'tmin_iç = min ölçüm',  standard:'TS EN 60811-201' },
    { id:'x4', label:'tmax_iç (iç yarı iletken)',      expression:'tmax_iç = max ölçüm',  standard:'TS EN 60811-201' },
    { id:'x5', label:'tmin_dış (dış yarı iletken)',    expression:'tmin_dış = min ölçüm', standard:'TS EN 60811-201' },
    { id:'x6', label:'tmax_dış (dış yarı iletken)',    expression:'tmax_dış = max ölçüm', standard:'TS EN 60811-201' },
    { id:'x7', label:'Eksen kaçıklığı',                expression:'e = √((x₁-x₂)² + (y₁-y₂)²)  [mm]', standard:'TS EN 60811' },
    { id:'x8', label:'Ovalite',                        expression:'ovalite = dmax/dmin × 100', standard:'TS EN 60811-201' },
    { id:'x9', label:'İzolasyon kaçıklığı',            expression:'kaç = (tmax-tmin)/tmax × 100 [%]', standard:'TS EN 60811-201' },
  ],
  TESISAT_SINGLE_COLOR: [
    { id:'s1', label:'tmin (min izolasyon kalınlığı)', expression:'tmin = min(t₁,…,t₆)', standard:'TS EN 50525-1' },
    { id:'s2', label:'tmax (max izolasyon kalınlığı)', expression:'tmax = max(t₁,…,t₆)', standard:'TS EN 50525-1' },
    { id:'s3', label:'Renk oranı (y1+y2)',             expression:'(y1+y2)/360 × 100 ≥ 30%', standard:'TS EN 50525-1' },
    { id:'s4', label:'Eksen kaçıklığı |O1-O2|',        expression:'e = |O1-O2|  [mm]',   standard:'TS EN 50525-1' },
    { id:'s5', label:'İç çap (D_inner)',               expression:'D_inner = 2 × r_iletken  [mm]', standard:'TS EN 50525-1' },
    { id:'s6', label:'Dış çap (D_outer)',               expression:'D_outer = 2 × r_dış  [mm]', standard:'TS EN 50525-1' },
  ],
  TESISAT_MULTI_CORE: [
    { id:'m1', label:'t1 (1. damar min kalınlık)', expression:'t1 = min ölçüm (damar 1)', standard:'TS EN 60811-202' },
    { id:'m2', label:'t2 (2. damar min kalınlık)', expression:'t2 = min ölçüm (damar 2)', standard:'TS EN 60811-202' },
    { id:'m3', label:'t3 (3. damar min kalınlık)', expression:'t3 = min ölçüm (damar 3)', standard:'TS EN 60811-202' },
    { id:'m4', label:'Eksen kaçıklığı |O1-O2|',    expression:'e = √((x₁-x₂)²+(y₁-y₂)²)', standard:'TS EN 60811-202' },
    { id:'m5', label:'Dış çap',                    expression:'D_outer = 2×r_dış', standard:'TS EN 60811-202' },
  ],
  TESISAT_NYAF_SOM: [
    { id:'n1', label:'tmin (min kalınlık)',         expression:'tmin = min(t₁,…,t₆)', standard:'TS EN 60811-202' },
    { id:'n2', label:'tmax (max kalınlık)',         expression:'tmax = max(t₁,…,t₆)', standard:'TS EN 60811-202' },
    { id:'n3', label:'Eksen kaçıklığı |O1-O2|',    expression:'e = |O1-O2|  [mm]', standard:'TS EN 60811-202' },
    { id:'n4', label:'İç çap',                     expression:'D_inner = 2×r_iletken', standard:'TS EN 60811-202' },
    { id:'n5', label:'Dış çap',                    expression:'D_outer = 2×r_dış', standard:'TS EN 60811-202' },
  ],
  AER: [
    { id:'a1', label:'tmin (min izolasyon)',        expression:'tmin = min(t₁,…,t₆)', standard:'TS 11654' },
    { id:'a2', label:'tmax (max izolasyon)',        expression:'tmax = max(t₁,…,t₆)', standard:'TS 11654' },
    { id:'a3', label:'Çıkıntı boyu (Çb)',           expression:'Çb = h_çıkıntı - h_nominal  [mm]', standard:'TS 11654' },
    { id:'a4', label:'Çıkıntılar arası mesafe (Çm)',expression:'Çm = arc(Ö₁,Ö₂)  [mm]', standard:'TS 11654' },
    { id:'a5', label:'Eksen kaçıklığı',             expression:'e = |O1-O2|  [mm]', standard:'TS 11654' },
  ],
  NYIF: [
    { id:'ny1', label:'tmin (min kalınlık)',        expression:'tmin = min(t₁,…,t₆)', standard:'TS EN 60811-202' },
    { id:'ny2', label:'tmax (max kalınlık)',        expression:'tmax = max(t₁,…,t₆)', standard:'TS EN 60811-202' },
    { id:'ny3', label:'y1 (köprü genişliği)',       expression:'y1 = sol-sağ damar arası  [mm]', standard:'TS EN 60811-202' },
    { id:'ny4', label:'y2 (köprü yüksekliği)',      expression:'y2 = köprü yüksekliği  [mm]', standard:'TS EN 60811-202' },
  ],
  YASSI_TTR: [
    { id:'t1', label:'t1_max = max(t₁,…,t₆)',      expression:'t1max = max(t₁,t₂,t₃,t₄,t₅,t₆)', standard:'TS EN 60811-202' },
    { id:'t2', label:'t1_min = min(t₁,…,t₆)',      expression:'t1min = min(t₁,t₂,t₃,t₄,t₅,t₆)', standard:'TS EN 60811-202' },
    { id:'t3', label:'t1_ort = ortalama',           expression:'t1ort = (t₁+t₂+…+t₆)/6', standard:'TS EN 60811-202' },
    { id:'t4', label:'t2_max = max(t₇,t₈)',        expression:'t2max = max(t₇,t₈)', standard:'TS EN 60811-202' },
    { id:'t5', label:'t2_min = min(t₇,t₈)',        expression:'t2min = min(t₇,t∸)', standard:'TS EN 60811-202' },
    { id:'t6', label:'y1 (kablo yüksekliği)',       expression:'y1  [mm]', standard:'TS EN 60811-202' },
    { id:'t7', label:'y2 (kablo genişliği)',        expression:'y2  [mm]', standard:'TS EN 60811-202' },
  ],
  SEKTOR: [
    { id:'sk1', label:'tmin (min kalınlık)',        expression:'tmin = min(t₁,…,t₆)', standard:'TS EN 60811-202' },
    { id:'sk2', label:'Eksen kaçıklığı |O1-O2|',   expression:'e = |O1-O2|  [mm]', standard:'TS EN 60811-202' },
  ],
};

const STORAGE_KEY = 'cable_formulas_v1';

export class FormulaService {

  /**
   * Loads formulas for all cable types from localStorage (or defaults).
   */
  public static loadAllFormulas(): Record<string, Formula[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_FORMULAS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_FORMULAS, ...parsed };
    } catch {
      return { ...DEFAULT_FORMULAS };
    }
  }

  /**
   * Saves updated formula dictionary to localStorage.
   */
  public static saveAllFormulas(formulas: Record<string, Formula[]>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
    } catch {
      // ignore quota / storage errors
    }
  }

  /**
   * Returns active formulas specifically for a given cable type.
   */
  public static getFormulasForCable(cableType: CableTypeCategory): Formula[] {
    const all = FormulaService.loadAllFormulas();
    return all[cableType] || DEFAULT_FORMULAS[cableType] || [];
  }
}
