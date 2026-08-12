import type { CableTypeCategory } from '../core/interfaces/cable';

export interface Formula {
  id: string;
  category: 'DIAMETER' | 'DISTANCES_FORMS' | 'WALLS' | 'AREAS_VOLUMES' | 'CONCENTRICITIES' | 'OTHERS';
  label: string;
  expression: string;
  standard?: string;
  enabled?: boolean;
}

export interface FormulaCategoryDef {
  id: 'DIAMETER' | 'DISTANCES_FORMS' | 'WALLS' | 'AREAS_VOLUMES' | 'CONCENTRICITIES' | 'OTHERS';
  titleTr: string;
  titleEn: string;
  formulas: Formula[];
}

/**
 * VELOX / EK_2 Master Formula Library categorized by parameter types (Image 1)
 */
export const EK2_MASTER_FORMULA_CATALOG: FormulaCategoryDef[] = [
  {
    id: 'DIAMETER',
    titleTr: 'Diameter (Çap Ölçümleri)',
    titleEn: 'Diameter Measurements',
    formulas: [
      { id: 'd_outer_avg', category: 'DIAMETER', label: 'Diameter outer avg (contour)', expression: 'D_outer = 2 × r_dış [mm]', standard: 'TS EN 60811-201' },
      { id: 'd_outer_min', category: 'DIAMETER', label: 'Diameter outer min', expression: 'D_min = 2 × r_dış_min [mm]', standard: 'TS EN 60811-201' },
      { id: 'd_outer_max', category: 'DIAMETER', label: 'Diameter outer max', expression: 'D_max = 2 × r_dış_max [mm]', standard: 'TS EN 60811-201' },
      { id: 'd_inner', category: 'DIAMETER', label: 'Diameter inner (WPs)', expression: 'D_inner = 2 × r_iletken [mm]', standard: 'TS EN 60811-201' },
    ]
  },
  {
    id: 'DISTANCES_FORMS',
    titleTr: 'Distances & Forms (Mesafe ve Şekiller)',
    titleEn: 'Distances & Forms',
    formulas: [
      { id: 'y1_bridge', category: 'DISTANCES_FORMS', label: 'Bridge width (y1)', expression: 'y1 = sol-sağ damar arası [mm]', standard: 'TS EN 60811-202' },
      { id: 'y2_bridge', category: 'DISTANCES_FORMS', label: 'Bridge height / Cable width (y2)', expression: 'y2 = köprü yüksekliği [mm]', standard: 'TS EN 60811-202' },
      { id: 'cb_ridge', category: 'DISTANCES_FORMS', label: 'Ridge height (Çb)', expression: 'Çb = h_çıkıntı - h_nominal [mm]', standard: 'TS 11654' },
      { id: 'cm_ridge', category: 'DISTANCES_FORMS', label: 'Ridge distance (Çm)', expression: 'Çm = arc(Ö₁,Ö₂) [mm]', standard: 'TS 11654' },
      { id: 'color_ratio', category: 'DISTANCES_FORMS', label: 'Color ratio (y1+y2)', expression: '(y1+y2)/360 × 100 ≥ %30', standard: 'TS EN 50525-1' },
    ]
  },
  {
    id: 'WALLS',
    titleTr: 'Walls (Et & İzolasyon Kalınlıkları)',
    titleEn: 'Wall Thicknesses',
    formulas: [
      { id: 'wall_tmin', category: 'WALLS', label: 'Wall thickness min', expression: 'tmin = min(t₁,…,t₆) [mm]', standard: 'TS EN 60811-201' },
      { id: 'wall_tmax', category: 'WALLS', label: 'Wall thickness max', expression: 'tmax = max(t₁,…,t₆) [mm]', standard: 'TS EN 60811-201' },
      { id: 'wall_tavg', category: 'WALLS', label: 'Wall thickness avg', expression: 't_ort = (t₁+t₂+…+t₆)/6 [mm]', standard: 'TS EN 60811-201' },
      { id: 'wall_ic_min', category: 'WALLS', label: 'Inner semiconductor min', expression: 'tmin_iç = min ölçüm [mm]', standard: 'TS EN 60811-201' },
      { id: 'wall_ic_max', category: 'WALLS', label: 'Inner semiconductor max', expression: 'tmax_iç = max ölçüm [mm]', standard: 'TS EN 60811-201' },
      { id: 'wall_dis_min', category: 'WALLS', label: 'Outer semiconductor min', expression: 'tmin_dış = min ölçüm [mm]', standard: 'TS EN 60811-201' },
      { id: 'wall_dis_max', category: 'WALLS', label: 'Outer semiconductor max', expression: 'tmax_dış = max ölçüm [mm]', standard: 'TS EN 60811-201' },
      { id: 'multi_t1', category: 'WALLS', label: 'Core 1 min thickness (t1)', expression: 't1 = min ölçüm (damar 1) [mm]', standard: 'TS EN 60811-202' },
      { id: 'multi_t2', category: 'WALLS', label: 'Core 2 min thickness (t2)', expression: 't2 = min ölçüm (damar 2) [mm]', standard: 'TS EN 60811-202' },
      { id: 'multi_t3', category: 'WALLS', label: 'Core 3 min thickness (t3)', expression: 't3 = min ölçüm (damar 3) [mm]', standard: 'TS EN 60811-202' },
    ]
  },
  {
    id: 'AREAS_VOLUMES',
    titleTr: 'Areas & Volumes (Alanlar ve Hacimler)',
    titleEn: 'Areas & Volumes',
    formulas: [
      { id: 'area_real', category: 'AREAS_VOLUMES', label: 'Cross-section real area', expression: 'A_iso = π × (r_dış² - r_iç²) [mm²]', standard: 'TS EN 60811-201' },
      { id: 'area_conductor', category: 'AREAS_VOLUMES', label: 'Conductor cross-section area', expression: 'A_cond = π × r_iç² [mm²]', standard: 'TS EN 60811-201' },
    ]
  },
  {
    id: 'CONCENTRICITIES',
    titleTr: 'Concentricities (Kaçıklık & Ovalite)',
    titleEn: 'Concentricities & Eccentricity',
    formulas: [
      { id: 'centricity', category: 'CONCENTRICITIES', label: 'Concentricity (tmin/tmax)', expression: 'Concentricity = (tmin / tmax) × 100 [%]', standard: 'TS EN 60811-201' },
      { id: 'eccentricity', category: 'CONCENTRICITIES', label: 'Decentricity [VCE] |O1-O2|', expression: 'e = √((x₁-x₂)² + (y₁-y₂)²) [mm]', standard: 'TS EN 60811-201' },
      { id: 'ovalite', category: 'CONCENTRICITIES', label: 'Ovality / Ovalness', expression: 'ovalite = (dmax / dmin) × 100 [%]', standard: 'TS EN 60811-201' },
      { id: 'kaçıklık_iso', category: 'CONCENTRICITIES', label: 'Isolation eccentricity ratio', expression: 'kaç = ((tmax-tmin)/tmax) × 100 [%]', standard: 'TS EN 60811-201' },
    ]
  },
  {
    id: 'OTHERS',
    titleTr: 'Others (Diğer / Özel Formüller)',
    titleEn: 'Others / Special Standards',
    formulas: [
      { id: 'custom_std', category: 'OTHERS', label: 'Standard compliance ratio', expression: 'Spec_SN = (tmin / t_nominal) × 100 [%]', standard: 'TS EN 60811-201' },
    ]
  }
];

export const DEFAULT_FORMULAS: Record<string, Formula[]> = {
  XLPE_HV: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[0], // wall_tmin
    EK2_MASTER_FORMULA_CATALOG[2].formulas[1], // wall_tmax
    EK2_MASTER_FORMULA_CATALOG[2].formulas[2], // wall_tavg
    EK2_MASTER_FORMULA_CATALOG[4].formulas[0], // centricity
    EK2_MASTER_FORMULA_CATALOG[0].formulas[0], // d_outer_avg
    EK2_MASTER_FORMULA_CATALOG[3].formulas[0], // area_real
  ],
  TESISAT_SINGLE_COLOR: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[0], // wall_tmin
    EK2_MASTER_FORMULA_CATALOG[2].formulas[1], // wall_tmax
    EK2_MASTER_FORMULA_CATALOG[1].formulas[4], // color_ratio
    EK2_MASTER_FORMULA_CATALOG[4].formulas[1], // eccentricity
    EK2_MASTER_FORMULA_CATALOG[0].formulas[3], // d_inner
    EK2_MASTER_FORMULA_CATALOG[0].formulas[0], // d_outer_avg
  ],
  TESISAT_MULTI_CORE: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[7], // multi_t1
    EK2_MASTER_FORMULA_CATALOG[2].formulas[8], // multi_t2
    EK2_MASTER_FORMULA_CATALOG[2].formulas[9], // multi_t3
    EK2_MASTER_FORMULA_CATALOG[4].formulas[1], // eccentricity
    EK2_MASTER_FORMULA_CATALOG[0].formulas[0], // d_outer_avg
  ],
  TESISAT_NYAF_SOM: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[0], // wall_tmin
    EK2_MASTER_FORMULA_CATALOG[2].formulas[1], // wall_tmax
    EK2_MASTER_FORMULA_CATALOG[4].formulas[1], // eccentricity
    EK2_MASTER_FORMULA_CATALOG[0].formulas[3], // d_inner
    EK2_MASTER_FORMULA_CATALOG[0].formulas[0], // d_outer_avg
  ],
  AER: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[0], // wall_tmin
    EK2_MASTER_FORMULA_CATALOG[2].formulas[1], // wall_tmax
    EK2_MASTER_FORMULA_CATALOG[1].formulas[2], // cb_ridge
    EK2_MASTER_FORMULA_CATALOG[1].formulas[3], // cm_ridge
    EK2_MASTER_FORMULA_CATALOG[4].formulas[1], // eccentricity
  ],
  NYIF: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[0], // wall_tmin
    EK2_MASTER_FORMULA_CATALOG[2].formulas[1], // wall_tmax
    EK2_MASTER_FORMULA_CATALOG[1].formulas[0], // y1_bridge
    EK2_MASTER_FORMULA_CATALOG[1].formulas[1], // y2_bridge
  ],
  YASSI_TTR: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[0], // wall_tmin
    EK2_MASTER_FORMULA_CATALOG[2].formulas[1], // wall_tmax
    EK2_MASTER_FORMULA_CATALOG[2].formulas[2], // wall_tavg
    EK2_MASTER_FORMULA_CATALOG[1].formulas[1], // y2_bridge
  ],
  SEKTOR: [
    EK2_MASTER_FORMULA_CATALOG[2].formulas[0], // wall_tmin
    EK2_MASTER_FORMULA_CATALOG[4].formulas[1], // eccentricity
  ],
};

const STORAGE_KEY = 'cable_formulas_v3';

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
