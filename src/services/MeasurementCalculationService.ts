import type { CableTypeCategory, IMeasurementParameter, IMeasurementResult } from '../core/interfaces/cable';
import { CableTypeCategoryEnum } from '../core/interfaces/cable';

export class MeasurementCalculationService {
  public static calculate(cableType: CableTypeCategory, operatorName: string, orderNumber: string, notes: string): IMeasurementResult {
    const params: IMeasurementParameter[] = [];

    switch (cableType) {
      case CableTypeCategoryEnum.XLPE_HV:
        params.push(
          { key: 'tmin_xlpe', nameTr: 'XLPE Min Kalınlık', nameEn: 'XLPE Min Thickness', value: 4.24, unit: 'mm', minTolerance: 4.0, passed: true },
          { key: 'tmax_xlpe', nameTr: 'XLPE Max Kalınlık', nameEn: 'XLPE Max Thickness', value: 4.62, unit: 'mm', maxTolerance: 5.0, passed: true },
          { key: 'tmin_ic', nameTr: 'İç Yarı İletken Min', nameEn: 'Inner Semi-Con Min', value: 0.86, unit: 'mm', minTolerance: 0.7, passed: true },
          { key: 'tmax_ic', nameTr: 'İç Yarı İletken Max', nameEn: 'Inner Semi-Con Max', value: 0.95, unit: 'mm', maxTolerance: 1.2, passed: true },
          { key: 'eccentricity', nameTr: 'İzolasyon Kaçıklığı', nameEn: 'Eccentricity', value: 8.22, unit: '%', maxTolerance: 15.0, passed: true },
          { key: 'ovality', nameTr: 'Ovalite', nameEn: 'Ovality', value: 98.4, unit: '%', minTolerance: 95.0, passed: true }
        );
        break;

      case CableTypeCategoryEnum.TESISAT_SINGLE_COLOR:
        params.push(
          { key: 'tmin', nameTr: 'Min İzolasyon Kalınlığı', nameEn: 'Min Insulation Thickness', value: 0.72, unit: 'mm', minTolerance: 0.6, passed: true },
          { key: 'tmax', nameTr: 'Max İzolasyon Kalınlığı', nameEn: 'Max Insulation Thickness', value: 0.85, unit: 'mm', maxTolerance: 1.0, passed: true },
          { key: 'color_ratio', nameTr: 'Sarı-Yeşil Renk Oranı', nameEn: 'Yellow-Green Color Ratio', value: 34.5, unit: '%', minTolerance: 30.0, passed: true },
          { key: 'eccentricity', nameTr: 'Eksen Kaçıklığı (O1-O2)', nameEn: 'Axis Offset (O1-O2)', value: 0.04, unit: 'mm', maxTolerance: 0.1, passed: true }
        );
        break;

      default:
        params.push(
          { key: 'tmin', nameTr: 'Min Yalıtım Kalınlığı', nameEn: 'Min Insulation Thickness', value: 1.15, unit: 'mm', minTolerance: 1.0, passed: true },
          { key: 'tmax', nameTr: 'Max Yalıtım Kalınlığı', nameEn: 'Max Insulation Thickness', value: 1.32, unit: 'mm', maxTolerance: 1.5, passed: true },
          { key: 'eccentricity', nameTr: 'Eksen Kaçıklığı', nameEn: 'Eccentricity', value: 0.05, unit: 'mm', maxTolerance: 0.12, passed: true }
        );
        break;
    }

    const overallPassed = params.every(p => p.passed);

    return {
      id: 'MEAS-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleString(),
      operatorName,
      orderNumber,
      cableType,
      cableName: cableType,
      standard: 'TS EN Standard compliant',
      parameters: params,
      overallPassed,
      notes
    };
  }
}
