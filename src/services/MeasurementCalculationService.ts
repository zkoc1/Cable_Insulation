import type { CableTypeCategory, IMeasurementParameter, IMeasurementResult } from '../core/interfaces/cable';
import { CableTypeCategoryEnum as C } from '../core/interfaces/cable';
import { CABLE_PROFILES } from '../core/data/profiles';

/**
 * Simulates measurement calculations for each cable type based on EK_2 parameters.
 * In production, these values come from the Python OpenCV backend via IPC.
 * Until camera integration is complete, we generate representative mock values.
 */
export class MeasurementCalculationService {

  static calculate(
    cableType: CableTypeCategory,
    operatorName: string,
    orderNumber: string,
    notes: string,
    imagePath?: string
  ): IMeasurementResult {

    const params: IMeasurementParameter[] = MeasurementCalculationService.buildParams(cableType);
    const profile = CABLE_PROFILES.find(p => p.id === cableType);
    const overallPassed = params.every(p => p.passed);

    return {
      id: 'MEAS-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleString('tr-TR'),
      operatorName,
      orderNumber,
      cableType,
      cableName: profile?.nameTr ?? cableType,
      standard: profile?.standard ?? '—',
      parameters: params,
      overallPassed,
      notes,
      imagePath,
    };
  }

  // Builds the parameter list for each cable type — values from EK_2 typical ranges
  private static buildParams(cableType: CableTypeCategory): IMeasurementParameter[] {
    // small random variation helper to simulate real measurement scatter
    const rand = (base: number, range: number) =>
      parseFloat((base + (Math.random() - 0.5) * range).toFixed(3));

    switch (cableType) {
      case C.XLPE_HV: return [
        { key:'tmin_xlpe',  nameTr:'XLPE Min Kalınlık',         nameEn:'XLPE Min Thickness',       value:rand(4.3,0.4), unit:'mm', minTolerance:4.0,  passed:true },
        { key:'tmax_xlpe',  nameTr:'XLPE Max Kalınlık',         nameEn:'XLPE Max Thickness',       value:rand(4.7,0.3), unit:'mm', maxTolerance:5.0,  passed:true },
        { key:'tmin_ic',    nameTr:'İç Yarı İletken Min',       nameEn:'Inner Semi-Con Min',       value:rand(0.85,0.15),unit:'mm',minTolerance:0.7,  passed:true },
        { key:'tmax_ic',    nameTr:'İç Yarı İletken Max',       nameEn:'Inner Semi-Con Max',       value:rand(0.92,0.12),unit:'mm',maxTolerance:1.2,  passed:true },
        { key:'tmin_dis',   nameTr:'Dış Yarı İletken Min',      nameEn:'Outer Semi-Con Min',       value:rand(0.8,0.15), unit:'mm',minTolerance:0.6,  passed:true },
        { key:'tmax_dis',   nameTr:'Dış Yarı İletken Max',      nameEn:'Outer Semi-Con Max',       value:rand(0.9,0.12), unit:'mm',maxTolerance:1.1,  passed:true },
        { key:'eccentricity',nameTr:'İzolasyon Kaçıklığı',      nameEn:'Insulation Eccentricity',  value:rand(8,3),      unit:'%', maxTolerance:15.0, passed:true },
        { key:'ovality',    nameTr:'Ovalite',                   nameEn:'Ovality',                  value:rand(98,2),     unit:'%', minTolerance:95.0, passed:true },
        { key:'eksen',      nameTr:'Eksen Kaçıklığı |O1-O2|',   nameEn:'Axis Offset |O1-O2|',      value:rand(0.05,0.04),unit:'mm',maxTolerance:0.2,  passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      case C.TESISAT_SINGLE_COLOR: return [
        { key:'tmin',        nameTr:'Min İzolasyon Kalınlığı',  nameEn:'Min Insulation Thickness', value:rand(0.72,0.15),unit:'mm',minTolerance:0.6,  passed:true },
        { key:'tmax',        nameTr:'Max İzolasyon Kalınlığı',  nameEn:'Max Insulation Thickness', value:rand(0.85,0.1), unit:'mm',maxTolerance:1.0,  passed:true },
        { key:'color_ratio', nameTr:'Sarı-Yeşil Renk Oranı',   nameEn:'Yellow-Green Color Ratio', value:rand(34,6),     unit:'%', minTolerance:30.0, passed:true },
        { key:'eksen',       nameTr:'Eksen Kaçıklığı |O1-O2|',  nameEn:'Axis Offset |O1-O2|',      value:rand(0.04,0.04),unit:'mm',maxTolerance:0.1,  passed:true },
        { key:'ic_cap',      nameTr:'İç Çap',                   nameEn:'Inner Diameter',           value:rand(2.5,0.3),  unit:'mm',                           passed:true },
        { key:'dis_cap',     nameTr:'Dış Çap',                  nameEn:'Outer Diameter',           value:rand(3.8,0.3),  unit:'mm',                           passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      case C.TESISAT_MULTI_CORE: return [
        { key:'t1',    nameTr:'t1 – 1. Damar Min Kalınlık',  nameEn:'t1 – Core 1 Min Thickness', value:rand(0.7,0.15),unit:'mm',minTolerance:0.5, passed:true },
        { key:'t2',    nameTr:'t2 – 2. Damar Min Kalınlık',  nameEn:'t2 – Core 2 Min Thickness', value:rand(0.68,0.15),unit:'mm',minTolerance:0.5,passed:true },
        { key:'t3',    nameTr:'t3 – 3. Damar Min Kalınlık',  nameEn:'t3 – Core 3 Min Thickness', value:rand(0.71,0.15),unit:'mm',minTolerance:0.5,passed:true },
        { key:'eksen', nameTr:'Eksen Kaçıklığı |O1-O2|',     nameEn:'Axis Offset |O1-O2|',       value:rand(0.05,0.05),unit:'mm',maxTolerance:0.15,passed:true },
        { key:'dis',   nameTr:'Dış Çap',                     nameEn:'Outer Diameter',             value:rand(9.5,1),   unit:'mm',                     passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      case C.TESISAT_NYAF_SOM: return [
        { key:'tmin',  nameTr:'Min İzolasyon Kalınlığı', nameEn:'Min Insulation Thickness', value:rand(0.8,0.2), unit:'mm', minTolerance:0.6, passed:true },
        { key:'tmax',  nameTr:'Max İzolasyon Kalınlığı', nameEn:'Max Insulation Thickness', value:rand(0.95,0.2),unit:'mm', maxTolerance:1.2, passed:true },
        { key:'eksen', nameTr:'Eksen Kaçıklığı |O1-O2|', nameEn:'Axis Offset |O1-O2|',     value:rand(0.04,0.04),unit:'mm',maxTolerance:0.12,passed:true },
        { key:'ic',    nameTr:'İç Çap',                  nameEn:'Inner Diameter',           value:rand(2.0,0.3), unit:'mm',                      passed:true },
        { key:'dis',   nameTr:'Dış Çap',                 nameEn:'Outer Diameter',           value:rand(3.6,0.3), unit:'mm',                      passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      case C.AER: return [
        { key:'tmin', nameTr:'Min İzolasyon Kalınlığı',     nameEn:'Min Insulation Thickness', value:rand(1.2,0.2), unit:'mm', minTolerance:1.0, passed:true },
        { key:'tmax', nameTr:'Max İzolasyon Kalınlığı',     nameEn:'Max Insulation Thickness', value:rand(1.4,0.2), unit:'mm', maxTolerance:1.8, passed:true },
        { key:'Cb',   nameTr:'Çıkıntı Boyu (Çb)',           nameEn:'Ridge Height (Çb)',         value:rand(3.5,0.5), unit:'mm', minTolerance:3.0, passed:true },
        { key:'Cm',   nameTr:'Çıkıntılar Arası Mesafe (Çm)',nameEn:'Ridge Spacing (Çm)',        value:rand(22,2),    unit:'mm', minTolerance:18.0,passed:true },
        { key:'eksen',nameTr:'Eksen Kaçıklığı |O1-O2|',     nameEn:'Axis Offset |O1-O2|',      value:rand(0.06,0.05),unit:'mm',maxTolerance:0.2, passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      case C.NYIF: return [
        { key:'tmin', nameTr:'Min İzolasyon Kalınlığı', nameEn:'Min Insulation Thickness', value:rand(0.8,0.15), unit:'mm', minTolerance:0.6, passed:true },
        { key:'tmax', nameTr:'Max İzolasyon Kalınlığı', nameEn:'Max Insulation Thickness', value:rand(0.95,0.15),unit:'mm', maxTolerance:1.2, passed:true },
        { key:'y1',   nameTr:'y1 – Köprü Genişliği',    nameEn:'y1 – Bridge Width',        value:rand(1.2,0.3),  unit:'mm',                     passed:true },
        { key:'y2',   nameTr:'y2 – Köprü Yüksekliği',   nameEn:'y2 – Bridge Height',       value:rand(0.9,0.2),  unit:'mm',                     passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      case C.YASSI_TTR: return [
        { key:'t1_max', nameTr:'t1max – 6-Nokta Max', nameEn:'t1max – 6-Point Max', value:rand(1.3,0.2), unit:'mm', maxTolerance:1.6, passed:true },
        { key:'t1_min', nameTr:'t1min – 6-Nokta Min', nameEn:'t1min – 6-Point Min', value:rand(1.0,0.2), unit:'mm', minTolerance:0.8, passed:true },
        { key:'t1_ort', nameTr:'t1ort – Ortalama',    nameEn:'t1avg – Average',     value:rand(1.15,0.1),unit:'mm',                    passed:true },
        { key:'t2_max', nameTr:'t2max – 2-Nokta Max', nameEn:'t2max – 2-Point Max', value:rand(1.2,0.2), unit:'mm', maxTolerance:1.5, passed:true },
        { key:'t2_min', nameTr:'t2min – 2-Nokta Min', nameEn:'t2min – 2-Point Min', value:rand(1.0,0.2), unit:'mm', minTolerance:0.8, passed:true },
        { key:'y1',     nameTr:'y1 – Kablo Yüksekliği',nameEn:'y1 – Cable Height',  value:rand(11,1),    unit:'mm',                    passed:true },
        { key:'y2',     nameTr:'y2 – Kablo Genişliği', nameEn:'y2 – Cable Width',   value:rand(35,2),    unit:'mm',                    passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      case C.SEKTOR: return [
        { key:'tmin',  nameTr:'Min İzolasyon Kalınlığı', nameEn:'Min Insulation Thickness', value:rand(1.8,0.3), unit:'mm', minTolerance:1.5, passed:true },
        { key:'eksen', nameTr:'Eksen Kaçıklığı |O1-O2|', nameEn:'Axis Offset |O1-O2|',      value:rand(0.07,0.06),unit:'mm',maxTolerance:0.2, passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));

      default: return [
        { key:'tmin', nameTr:'Min Kalınlık', nameEn:'Min Thickness', value:rand(1.0,0.2), unit:'mm', minTolerance:0.8, passed:true },
      ].map(p => ({ ...p, passed: MeasurementCalculationService.check(p) }));
    }
  }

  // Evaluates min/max tolerance for a single parameter
  private static check(p: IMeasurementParameter): boolean {
    if (p.minTolerance !== undefined && p.value < p.minTolerance) return false;
    if (p.maxTolerance !== undefined && p.value > p.maxTolerance) return false;
    return true;
  }
}
