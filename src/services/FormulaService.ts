import type { CableTypeCategory } from '../core/interfaces/cable';

export interface Formula {
  id: string;
  category: string;
  label: string;
  expression: string;
  standard?: string;
  enabled?: boolean;
}

export interface FormulaCategory {
  id: string;
  titleTr: string;
  titleEn: string;
  formulas: Formula[];
}

/**
 * Master catalog of all standard formulas defined in EK_2 specification.
 * Grouped into logical categories.
 */
export const EK2_MASTER_FORMULA_CATALOG: FormulaCategory[] = [
  {
    id: 'xlpe_hv',
    titleTr: 'XLPE Yüksek Gerilim İzolasyon Formülleri',
    titleEn: 'XLPE High Voltage Insulation Formulas',
    formulas: [
      { id: 'xlpe_tmin', category: 'XLPE_HV', label: 'tmin (XLPE min kalınlık)', expression: 'tmin = min(t₁,…,t₆)', standard: 'TS EN 60811-201' },
      { id: 'xlpe_tmax', category: 'XLPE_HV', label: 'tmax (XLPE max kalınlık)', expression: 'tmax = max(t₁,…,t₆)', standard: 'TS EN 60811-201' },
      { id: 'xlpe_ic_min', category: 'XLPE_HV', label: 'tmin_iç (İç yarı iletken min)', expression: 'tmin_iç = min ölçüm', standard: 'TS EN 60811-201' },
      { id: 'xlpe_ic_max', category: 'XLPE_HV', label: 'tmax_iç (İç yarı iletken max)', expression: 'tmax_iç = max ölçüm', standard: 'TS EN 60811-201' },
      { id: 'xlpe_dis_min', category: 'XLPE_HV', label: 'tmin_dış (Dış yarı iletken min)', expression: 'tmin_dış = min ölçüm', standard: 'TS EN 60811-201' },
      { id: 'xlpe_dis_max', category: 'XLPE_HV', label: 'tmax_dış (Dış yarı iletken max)', expression: 'tmax_dış = max ölçüm', standard: 'TS EN 60811-201' },
      { id: 'xlpe_eccentricity', category: 'XLPE_HV', label: 'Eksen (Merkez) kaçıklığı', expression: 'e = √((x₁-x₂)² + (y₁-y₂)²) [mm]', standard: 'TS EN 60811' },
      { id: 'xlpe_ovalite', category: 'XLPE_HV', label: 'Ovalite', expression: 'ovalite = dmax/dmin × 100 [%]', standard: 'TS EN 60811-201' },
      { id: 'xlpe_kaçıklık', category: 'XLPE_HV', label: 'İzolasyon kaçıklığı', expression: 'kaçıklık = (tmax-tmin)/tmax × 100 [%]', standard: 'TS EN 60811-201' },
    ]
  },
  {
    id: 'tesisat_single',
    titleTr: 'Tek Damarlı & Renkli Tesisat Kablosu Formülleri',
    titleEn: 'Single Core & Multi-Color Installation Formulas',
    formulas: [
      { id: 'sing_tmin', category: 'TESISAT_SINGLE_COLOR', label: 'tmin (min izolasyon kalınlığı)', expression: 'tmin = min(t₁,…,t₆)', standard: 'TS EN 50525-1' },
      { id: 'sing_tmax', category: 'TESISAT_SINGLE_COLOR', label: 'tmax (max izolasyon kalınlığı)', expression: 'tmax = max(t₁,…,t₆)', standard: 'TS EN 50525-1' },
      { id: 'sing_color_ratio', category: 'TESISAT_SINGLE_COLOR', label: 'Renklerin birbirine oranı (y1+y2)', expression: '(y1+y2)/360 × 100 ≥ %30', standard: 'TS EN 50525-1' },
      { id: 'sing_eccentricity', category: 'TESISAT_SINGLE_COLOR', label: 'Eksen kaçıklığı |O1-O2|', expression: 'e = |O1-O2| [mm]', standard: 'TS EN 50525-1' },
      { id: 'sing_d_inner', category: 'TESISAT_SINGLE_COLOR', label: 'İç çap (D_inner)', expression: 'D_inner = 2 × r_iletken [mm]', standard: 'TS EN 50525-1' },
      { id: 'sing_d_outer', category: 'TESISAT_SINGLE_COLOR', label: 'Dış çap (D_outer)', expression: 'D_outer = 2 × r_dış [mm]', standard: 'TS EN 50525-1' },
    ]
  },
  {
    id: 'tesisat_multi',
    titleTr: 'Çok Damarlı Tesisat Kablosu Formülleri',
    titleEn: 'Multi-Core Cable Formulas',
    formulas: [
      { id: 'multi_t1', category: 'TESISAT_MULTI_CORE', label: 't1 (1. damar min kalınlık)', expression: 't1 = min ölçüm (damar 1)', standard: 'TS EN 60811-202' },
      { id: 'multi_t2', category: 'TESISAT_MULTI_CORE', label: 't2 (2. damar min kalınlık)', expression: 't2 = min ölçüm (damar 2)', standard: 'TS EN 60811-202' },
      { id: 'multi_t3', category: 'TESISAT_MULTI_CORE', label: 't3 (3. damar min kalınlık)', expression: 't3 = min ölçüm (damar 3)', standard: 'TS EN 60811-202' },
      { id: 'multi_eccentricity', category: 'TESISAT_MULTI_CORE', label: 'Eksen kaçıklığı |O1-O2|', expression: 'e = √((x₁-x₂)²+(y₁-y₂)²)', standard: 'TS EN 60811-202' },
      { id: 'multi_d_outer', category: 'TESISAT_MULTI_CORE', label: 'Dış çap', expression: 'D_outer = 2 × r_dış', standard: 'TS EN 60811-202' },
    ]
  },
  {
    id: 'tesisat_nya',
    titleTr: 'Som & Çok Telli (NYAF / NYA) Formülleri',
    titleEn: 'Stranded & Solid Wire Formulas',
    formulas: [
      { id: 'nyaf_tmin', category: 'TESISAT_NYAF_SOM', label: 'tmin (min kalınlık)', expression: 'tmin = min(t₁,…,t₆)', standard: 'TS EN 60811-202' },
      { id: 'nyaf_tmax', category: 'TESISAT_NYAF_SOM', label: 'tmax (max kalınlık)', expression: 'tmax = max(t₁,…,t₆)', standard: 'TS EN 60811-202' },
      { id: 'nyaf_eccentricity', category: 'TESISAT_NYAF_SOM', label: 'Eksen kaçıklığı |O1-O2|', expression: 'e = |O1-O2| [mm]', standard: 'TS EN 60811-202' },
      { id: 'nyaf_d_inner', category: 'TESISAT_NYAF_SOM', label: 'İç çap', expression: 'D_inner = 2 × r_iletken', standard: 'TS EN 60811-202' },
      { id: 'nyaf_d_outer', category: 'TESISAT_NYAF_SOM', label: 'Dış çap', expression: 'D_outer = 2 × r_dış', standard: 'TS EN 60811-202' },
    ]
  },
  {
    id: 'aer_cable',
    titleTr: 'AER Kablo Çıkıntı ve Mesafe Formülleri',
    titleEn: 'AER Ridge & Distance Formulas',
    formulas: [
      { id: 'aer_tmin', category: 'AER', label: 'tmin (min izolasyon)', expression: 'tmin = min(t₁,…,t₆)', standard: 'TS 11654' },
      { id: 'aer_tmax', category: 'AER', label: 'tmax (max izolasyon)', expression: 'tmax = max(t₁,…,t₆)', standard: 'TS 11654' },
      { id: 'aer_cb', category: 'AER', label: 'Çıkıntı boyu (Çb)', expression: 'Çb = h_çıkıntı - h_nominal [mm]', standard: 'TS 11654' },
      { id: 'aer_cm', category: 'AER', label: 'Çıkıntılar arası mesafe (Çm)', expression: 'Çm = arc(Ö₁,Ö₂) [mm]', standard: 'TS 11654' },
      { id: 'aer_eccentricity', category: 'AER', label: 'Eksen kaçıklığı', expression: 'e = |O1-O2| [mm]', standard: 'TS 11654' },
    ]
  },
  {
    id: 'nyif_cable',
    titleTr: 'NYIF Yassı Köprülü Kablo Formülleri',
    titleEn: 'NYIF Flat Bridge Cable Formulas',
    formulas: [
      { id: 'nyif_tmin', category: 'NYIF', label: 'tmin (min kalınlık)', expression: 'tmin = min(t₁,…,t₆)', standard: 'TS EN 60811-202' },
      { id: 'nyif_tmax', category: 'NYIF', label: 'tmax (max kalınlık)', expression: 'tmax = max(t₁,…,t₆)', standard: 'TS EN 60811-202' },
      { id: 'nyif_y1', category: 'NYIF', label: 'y1 (köprü genişliği)', expression: 'y1 = sol-sağ damar arası [mm]', standard: 'TS EN 60811-202' },
      { id: 'nyif_y2', category: 'NYIF', label: 'y2 (köprü yüksekliği)', expression: 'y2 = köprü yüksekliği [mm]', standard: 'TS EN 60811-202' },
    ]
  },
  {
    id: 'yassi_ttr',
    titleTr: 'Yassı TTR Kablo Formülleri',
    titleEn: 'Flat TTR Cable Formulas',
    formulas: [
      { id: 'ttr_t1max', category: 'YASSI_TTR', label: 't1_max = max(t₁,…,t₆)', expression: 't1max = max(t₁,t₂,t₃,t₄,t₅,t₆)', standard: 'TS EN 60811-202' },
      { id: 'ttr_t1min', category: 'YASSI_TTR', label: 't1_min = min(t₁,…,t₆)', expression: 't1min = min(t₁,t₂,t₃,t₄,t₅,t₆)', standard: 'TS EN 60811-202' },
      { id: 'ttr_t1ort', category: 'YASSI_TTR', label: 't1_ort = ortalama', expression: 't1ort = (t₁+t₂+…+t₆)/6', standard: 'TS EN 60811-202' },
      { id: 'ttr_t2max', category: 'YASSI_TTR', label: 't2_max = max(t₇,t₈)', expression: 't2max = max(t₇,t₈)', standard: 'TS EN 60811-202' },
      { id: 'ttr_t2min', category: 'YASSI_TTR', label: 't2_min = min(t₇,t₈)', expression: 't2min = min(t₇,t₈)', standard: 'TS EN 60811-202' },
      { id: 'ttr_y1', category: 'YASSI_TTR', label: 'y1 (kablo yüksekliği)', expression: 'y1 [mm]', standard: 'TS EN 60811-202' },
      { id: 'ttr_y2', category: 'YASSI_TTR', label: 'y2 (kablo genişliği)', expression: 'y2 [mm]', standard: 'TS EN 60811-202' },
    ]
  },
  {
    id: 'sektor_cable',
    titleTr: 'Sektör Kablo Formülleri',
    titleEn: 'Sector Cable Formulas',
    formulas: [
      { id: 'sektor_tmin', category: 'SEKTOR', label: 'tmin (min kalınlık)', expression: 'tmin = min(t₁,…,t₆)', standard: 'TS EN 60811-202' },
      { id: 'sektor_eccentricity', category: 'SEKTOR', label: 'Eksen kaçıklığı |O1-O2|', expression: 'e = |O1-O2| [mm]', standard: 'TS EN 60811-202' },
    ]
  }
];

export const DEFAULT_FORMULAS: Record<string, Formula[]> = {
  XLPE_HV: EK2_MASTER_FORMULA_CATALOG[0].formulas,
  TESISAT_SINGLE_COLOR: EK2_MASTER_FORMULA_CATALOG[1].formulas,
  TESISAT_MULTI_CORE: EK2_MASTER_FORMULA_CATALOG[2].formulas,
  TESISAT_NYAF_SOM: EK2_MASTER_FORMULA_CATALOG[3].formulas,
  AER: EK2_MASTER_FORMULA_CATALOG[4].formulas,
  NYIF: EK2_MASTER_FORMULA_CATALOG[5].formulas,
  YASSI_TTR: EK2_MASTER_FORMULA_CATALOG[6].formulas,
  SEKTOR: EK2_MASTER_FORMULA_CATALOG[7].formulas,
};

const STORAGE_KEY = 'cable_formulas_v2';

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

