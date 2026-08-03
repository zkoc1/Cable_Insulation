import type { ICableProfile } from '../interfaces/cable';
import { CableTypeCategoryEnum } from '../interfaces/cable';

export const CABLE_PROFILES: ICableProfile[] = [
  {
    id: CableTypeCategoryEnum.XLPE_HV,
    nameTr: 'XLPE Yüksek Gerilim Kablosu',
    nameEn: 'XLPE High Voltage Cable',
    standard: 'TS EN 60811-201',
    descriptionTr: 'İç yarı iletken, XLPE yalıtkan ve dış yarı iletken katmanlı HV kablo.',
    descriptionEn: 'HV cable with inner semi-conductor, XLPE insulation and outer semi-conductor.',
    parameters: ['tmin_xlpe', 'tmax_xlpe', 'tmin_ic', 'tmax_ic', 'tmin_dis', 'tmax_dis', 'eccentricity', 'ovality'],
    icon: '⚡'
  },
  {
    id: CableTypeCategoryEnum.TESISAT_SINGLE_COLOR,
    nameTr: 'Tesisat - Tek Damarlı Renkli',
    nameEn: 'Single Core Colored Installation',
    standard: 'TS EN 50525-1',
    descriptionTr: 'Sarı-Yeşil renk oranlı (>=%30) ve tek damarlı tesisat kablosu.',
    descriptionEn: 'Yellow-Green color ratio (>=30%) single core installation cable.',
    parameters: ['tmin', 'tmax', 'color_ratio', 'eccentricity', 'inner_diameter', 'outer_diameter'],
    icon: '🟡'
  },
  {
    id: CableTypeCategoryEnum.TESISAT_MULTI_CORE,
    nameTr: 'Tesisat - Çok Damarlı (Örgülü)',
    nameEn: 'Multi-Core Stranded Installation',
    standard: 'TS EN 60811-202',
    descriptionTr: 'Çok damarlı esnek tesisat kablosu.',
    descriptionEn: 'Flexible multi-core installation cable.',
    parameters: ['t1', 't2', 't3', 'eccentricity', 'inner_diameter', 'outer_diameter'],
    icon: '🔌'
  },
  {
    id: CableTypeCategoryEnum.TESISAT_NYAF_SOM,
    nameTr: 'Tesisat - NYAF / Som Telli',
    nameEn: 'Single Core NYAF / Solid Wire',
    standard: 'TS EN 60811-202',
    descriptionTr: 'Tek damarlı çok telli veya som iletkenli tesisat kablosu.',
    descriptionEn: 'Single core stranded or solid wire installation cable.',
    parameters: ['tmin', 'tmax', 'eccentricity', 'inner_diameter', 'outer_diameter'],
    icon: '➰'
  },
  {
    id: CableTypeCategoryEnum.AER,
    nameTr: 'AER Kablo',
    nameEn: 'AER Aerial Bundled Cable',
    standard: 'TS 11654',
    descriptionTr: 'Hava hattında kullanılan çıkıntılı alüminyum iletkenli kablo.',
    descriptionEn: 'Aerial bundled aluminum cable with ridges.',
    parameters: ['tmin', 'tmax', 'ridge_height', 'ridge_distance', 'eccentricity'],
    icon: '📡'
  },
  {
    id: CableTypeCategoryEnum.NYIF,
    nameTr: 'NYIF Yassı Kablo',
    nameEn: 'NYIF Flat Cable',
    standard: 'TS EN 60811-202',
    descriptionTr: 'Sıva altı 2 damarlı yassı köprülü tesisat kablosu.',
    descriptionEn: 'Under-plaster 2-core flat bridged cable.',
    parameters: ['tmin', 'tmax', 'bridge_width', 'bridge_height'],
    icon: '▬'
  },
  {
    id: CableTypeCategoryEnum.YASSI_TTR,
    nameTr: 'Yassı TTR (H07VVH6-F)',
    nameEn: 'Flat TTR Cable',
    standard: 'TS EN 60811-202',
    descriptionTr: 'Asansör ve derin kuyu dalgıç pompaları için yassı kablo.',
    descriptionEn: 'Flat cable for elevators and submersible pumps.',
    parameters: ['t1_avg', 't2_avg', 'height', 'width'],
    icon: '↕️'
  },
  {
    id: CableTypeCategoryEnum.SEKTOR,
    nameTr: 'Sektör Kablo (NA2XXH)',
    nameEn: 'Sector Shaped Cable',
    standard: 'TS EN 60811-202',
    descriptionTr: 'Sektör kesitli dar alan montaj kablosu.',
    descriptionEn: 'Sector shaped cross-section cable for tight spaces.',
    parameters: ['tmin', 'center_offset_O1_O2', 'eccentricity'],
    icon: '📐'
  }
];
