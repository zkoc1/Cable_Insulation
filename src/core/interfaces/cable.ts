export type CableTypeCategory = 
  | 'XLPE_HV'
  | 'TESISAT_SINGLE_COLOR'
  | 'TESISAT_MULTI_CORE'
  | 'TESISAT_NYAF_SOM'
  | 'AER'
  | 'NYIF'
  | 'YASSI_TTR'
  | 'SEKTOR';

export const CableTypeCategoryEnum = {
  XLPE_HV: 'XLPE_HV' as CableTypeCategory,
  TESISAT_SINGLE_COLOR: 'TESISAT_SINGLE_COLOR' as CableTypeCategory,
  TESISAT_MULTI_CORE: 'TESISAT_MULTI_CORE' as CableTypeCategory,
  TESISAT_NYAF_SOM: 'TESISAT_NYAF_SOM' as CableTypeCategory,
  AER: 'AER' as CableTypeCategory,
  NYIF: 'NYIF' as CableTypeCategory,
  YASSI_TTR: 'YASSI_TTR' as CableTypeCategory,
  SEKTOR: 'SEKTOR' as CableTypeCategory
};

export interface ICableProfile {
  id: CableTypeCategory;
  nameTr: string;
  nameEn: string;
  standard: string;
  descriptionTr: string;
  descriptionEn: string;
  parameters: string[];
  icon: string;
}

export interface IMeasurementParameter {
  key: string;
  nameTr: string;
  nameEn: string;
  value: number;
  unit: string;
  minTolerance?: number;
  maxTolerance?: number;
  passed: boolean;
}

export interface IMeasurementResult {
  id: string;
  timestamp: string;
  operatorName: string;
  orderNumber: string;
  cableType: CableTypeCategory;
  cableName: string;
  standard: string;
  parameters: IMeasurementParameter[];
  overallPassed: boolean;
  notes?: string;
  imagePath?: string;
}

export interface IOperatorSession {
  username: string;
  role: 'OPERATOR' | 'ADMIN';
  isLoggedIn: boolean;
}
