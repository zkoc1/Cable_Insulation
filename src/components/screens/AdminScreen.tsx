import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { CableIcon } from '../cable/CableIcon';
import type { CableTypeCategory } from '../../core/interfaces/cable';

/* ─── Formula type definitions from EK_2 ─── */
interface Formula {
  label: string;
  latex: string;   // rendered as plain text for simplicity
  standard?: string;
}

const formulaGroups: { tab: string; formulas: Formula[] }[] = [
  {
    tab: 'Diameter',
    formulas: [
      { label: 'Concentricity (min/max)', latex: '(t_min / t_max) × 100%', standard: 'IEC 60811-201' },
      { label: 'Concentricity (min/avg)', latex: '(t_min / t_avg) × 100%' },
      { label: 'Concentricity (min/max) [VDE]', latex: '(t_min / t_upocol) × 100%' },
      { label: 'Concentricity M/L', latex: '(t_max − t_min) / Di_WPs × 100%' },
    ],
  },
  {
    tab: 'Walls',
    formulas: [
      { label: 'Wall thickness single value', latex: 't_i = (D_outer − D_inner) / 2' },
      { label: 'Wall thickness min', latex: 't_min = min(t_i)' },
      { label: 'Wall thickness avg', latex: 't_avg = Σt_i / n' },
      { label: 'Wall thickness max', latex: 't_max = max(t_i)' },
    ],
  },
  {
    tab: 'Eccentricity',
    formulas: [
      { label: 'Eccentricity (tmax)', latex: '(t_max / t_min) × 100%' },
      { label: 'Eccentricity (tavg)', latex: '(t_avg / t_min) × 100%', standard: 'ASTM D4565' },
      { label: 'Eccentricity [VDE]', latex: '(t_upocol / t_min) × 100%' },
      { label: 'Eccentricity M/L', latex: '(t_max − t_min) / D_error × 100%' },
      { label: 'Eksen Kaçıklığı (O1–O2)', latex: 'e = |O1 − O2|  [mm]', standard: 'TS EN 60811' },
    ],
  },
  {
    tab: 'Concentricities',
    formulas: [
      { label: 'Centricity', latex: '(1 − Konz) × 100%' },
      { label: 'Centricity (avg)', latex: '(1 − Konz_avg) × 100%' },
      { label: 'Centricity [VDE]', latex: '(1 − Konz_VDE) × 100%' },
      { label: 'Centricity M/L', latex: '(1 − Konz_ML) × 100%' },
    ],
  },
  {
    tab: 'Distances & Forms',
    formulas: [
      { label: 'Uncentricity', latex: '(t_avg − t_min) / 2  [mm]' },
      { label: 'Uncentricity (avg)', latex: '(t_upocol − t_min) / 2  [mm]' },
      { label: 'Uncentricity [IAA]', latex: '(t_upocol − t_min)  [mm]' },
      { label: 'Ovalite (yassı)', latex: 'Ov = (D_max − D_min) / D_avg × 100%', standard: 'TS EN 60811-201' },
      { label: 'Çıkıntı Boyu (AER)', latex: 'Çb = Yükseklik − nominal  [mm]', standard: 'TS 11654' },
      { label: 'Çıkıntılar arası mesafe (AER)', latex: 'Çm = arc_length(Ö1, Ö2)  [mm]', standard: 'TS 11654' },
    ],
  },
  {
    tab: 'Areas & Volumes',
    formulas: [
      { label: 'Cross-section (contour)', latex: 'A_contour = π × (D_outer/2)²  [mm²]' },
      { label: 'Cross-section real area', latex: 'A_real = A_contour − A_inner  [mm²]' },
      { label: 'Mpa − Mpi (pressure diff)', latex: 'ΔP = M_Pa − M_Pi' },
    ],
  },
];

/* Per-cable-type parameter list from EK_2 */
const cableParams: Record<string, { name: string; formula: string; standard: string }[]> = {
  XLPE_HV: [
    { name:'tmin_xlpe', formula:'min. XLPE duvar kalınlığı (6 ölçüm)', standard:'TS EN 60811-201' },
    { name:'tmax_xlpe', formula:'max. XLPE duvar kalınlığı', standard:'TS EN 60811-201' },
    { name:'tmin_ic',   formula:'İç yarı iletken min. kalınlık', standard:'TS EN 60811-201' },
    { name:'tmax_ic',   formula:'İç yarı iletken max. kalınlık', standard:'TS EN 60811-201' },
    { name:'tmin_dis',  formula:'Dış yarı iletken min. kalınlık', standard:'TS EN 60811-201' },
    { name:'tmax_dis',  formula:'Dış yarı iletken max. kalınlık', standard:'TS EN 60811-201' },
    { name:'eccentricity', formula:'|O1−O2| / (D_outer/2) × 100%', standard:'TS EN 60811' },
    { name:'ovality',      formula:'(D_max−D_min)/D_avg × 100%',  standard:'TS EN 60811-201' },
  ],
  TESISAT_SINGLE_COLOR: [
    { name:'tmin', formula:'min. izolasyon kalınlığı',             standard:'TS EN 50525-1' },
    { name:'tmax', formula:'max. izolasyon kalınlığı',             standard:'TS EN 50525-1' },
    { name:'O1',   formula:'Dış çember ağırlık merkezi',           standard:'TS EN 50525-1' },
    { name:'O2',   formula:'İzolasyon ağırlık merkezi',            standard:'TS EN 50525-1' },
    { name:'y1',   formula:'Sarı yay uzunluğu (arc length)',       standard:'TS EN 50525-1' },
    { name:'y2',   formula:'Yeşil yay uzunluğu (arc length)',      standard:'TS EN 50525-1' },
    { name:'renk_orani', formula:'y1/(y1+y2) × 100% ≥ 30%',      standard:'TS EN 50525-1' },
    { name:'eksen_kacikligi', formula:'|O1−O2|  [mm]',            standard:'TS EN 50525-1' },
  ],
  TESISAT_MULTI_CORE: [
    { name:'t1', formula:'1. damar min. duvar kalınlığı', standard:'TS EN 60811-202' },
    { name:'t2', formula:'2. damar min. duvar kalınlığı', standard:'TS EN 60811-202' },
    { name:'t3', formula:'3. damar min. duvar kalınlığı', standard:'TS EN 60811-202' },
    { name:'O1', formula:'Dış kılıf merkezi',             standard:'TS EN 60811-202' },
    { name:'O2', formula:'İzolasyon merkezi',             standard:'TS EN 60811-202' },
    { name:'eksen_kacikligi', formula:'|O1−O2|  [mm]',   standard:'TS EN 60811-202' },
  ],
  TESISAT_NYAF_SOM: [
    { name:'tmin', formula:'min. izolasyon kalınlığı',    standard:'TS EN 60811-202' },
    { name:'O1',   formula:'Dış çember merkezi',          standard:'TS EN 60811-202' },
    { name:'O2',   formula:'İletken merkezi',             standard:'TS EN 60811-202' },
    { name:'ic_cap',  formula:'D_inner (WPs) [mm]',       standard:'TS EN 60811-202' },
    { name:'dis_cap', formula:'D_outer (contour) [mm]',   standard:'TS EN 60811-202' },
    { name:'eksen_kacikligi', formula:'|O1−O2|  [mm]',   standard:'TS EN 60811-202' },
  ],
  AER: [
    { name:'tmin', formula:'min. izolasyon kalınlığı',      standard:'TS 11654' },
    { name:'tmax', formula:'max. izolasyon kalınlığı',      standard:'TS 11654' },
    { name:'O1',   formula:'İletken ağırlık merkezi',       standard:'TS 11654' },
    { name:'O2',   formula:'İzolasyon ağırlık merkezi',     standard:'TS 11654' },
    { name:'Cb',   formula:'Çıkıntı boyu (Çb) [mm]',       standard:'TS 11654' },
    { name:'Cm',   formula:'Çıkıntılar arası mesafe [mm]', standard:'TS 11654' },
    { name:'eksen_kacikligi', formula:'|O1−O2| [mm]',      standard:'TS 11654' },
  ],
  NYIF: [
    { name:'tmin',  formula:'min. izolasyon kalınlığı',     standard:'TS EN 60811-202' },
    { name:'tmax',  formula:'max. izolasyon kalınlığı',     standard:'TS EN 60811-202' },
    { name:'y1',    formula:'Köprü genişliği  [mm]',        standard:'TS EN 60811-202' },
    { name:'y2',    formula:'Köprü yüksekliği [mm]',        standard:'TS EN 60811-202' },
  ],
  YASSI_TTR: [
    { name:'t1–t6', formula:'6 noktada duvar kalınlığı',    standard:'TS EN 60811-202' },
    { name:'t7–t8', formula:'2 ek ölçüm noktası',          standard:'TS EN 60811-202' },
    { name:'y1',    formula:'Kablo yüksekliği [mm]',        standard:'TS EN 60811-202' },
    { name:'y2',    formula:'Kablo genişliği  [mm]',        standard:'TS EN 60811-202' },
    { name:'t_avg', formula:'Ortalama duvar kalınlığı',     standard:'TS EN 60811-202' },
  ],
  SEKTOR: [
    { name:'tmin',  formula:'min. izolasyon kalınlığı',           standard:'TS EN 60811-202' },
    { name:'O1',    formula:'İletken ağırlık merkezi',            standard:'TS EN 60811-202' },
    { name:'O2',    formula:'Yalıtım ağırlık merkezi',            standard:'TS EN 60811-202' },
    { name:'eksen_kacikligi', formula:'|O1−O2|  [mm]',           standard:'TS EN 60811-202' },
  ],
};

export const AdminScreen: React.FC = () => {
  const { lang, setActiveScreen } = useAppStore();
  const [activeFormulaTab, setActiveFormulaTab] = useState(0);
  const [activeCable, setActiveCable] = useState<CableTypeCategory | null>(null);

  const selectedCableParams = activeCable ? (cableParams[activeCable] ?? []) : [];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 60px)', overflow:'hidden', background:'#0a0c0f' }}>

      {/* ─── Header bar ─── */}
      <div style={{ padding:'10px 20px', background:'#111318', borderBottom:'1px solid #1e2330', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'#4ade80', fontWeight:800, fontSize:16 }}>⚙️ Admin Panel</span>
          <span style={{ color:'#475569', fontSize:12 }}>Standartlar & Formüller — EK_2</span>
        </div>
        <button
          onClick={() => setActiveScreen('measurement')}
          style={{ background:'#1e2330', border:'1px solid #262d3a', color:'#f1f5f9', padding:'6px 14px', borderRadius:6, fontSize:13, fontWeight:600 }}
        >
          ← Geri
        </button>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ─── Left: Cable type list ─── */}
        <div style={{ width:260, borderRight:'1px solid #1e2330', display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <div style={{ padding:'10px 14px', color:'#94a3b8', fontSize:11, fontWeight:700, borderBottom:'1px solid #1e2330', textTransform:'uppercase', letterSpacing:1 }}>
            Kablo Tipleri (EK_2)
          </div>
          {CABLE_PROFILES.map(p => {
            const active = activeCable === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveCable(active ? null : p.id as CableTypeCategory)}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 14px',
                  background: active ? '#0f2e1a' : 'transparent',
                  border:'none',
                  borderBottom:'1px solid #12161e',
                  cursor:'pointer',
                  textAlign:'left',
                  borderLeft: active ? '3px solid #4ade80' : '3px solid transparent',
                }}
              >
                <CableIcon type={p.id as CableTypeCategory}/>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color: active ? '#4ade80' : '#f1f5f9' }}>
                    {lang === 'tr' ? p.nameTr : p.nameEn}
                  </div>
                  <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>{p.standard}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Right: Content area ─── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* If cable selected → show its parameter list */}
          {activeCable && (
            <div style={{ borderBottom:'1px solid #1e2330', padding:'12px 20px', background:'#0e1015' }}>
              <div style={{ color:'#4ade80', fontWeight:700, fontSize:14, marginBottom:10 }}>
                📋 {CABLE_PROFILES.find(p => p.id === activeCable)?.[lang === 'tr' ? 'nameTr' : 'nameEn']} — Ölçüm Parametreleri
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                {selectedCableParams.map((param, i) => (
                  <div key={i} style={{
                    background:'#111318', border:'1px solid #262d3a', borderRadius:8, padding:'10px 14px', minWidth:210
                  }}>
                    <div style={{ color:'#38bdf8', fontWeight:700, fontSize:12, marginBottom:4 }}>{param.name}</div>
                    <div style={{ color:'#94a3b8', fontSize:11, fontFamily:'monospace', marginBottom:4 }}>{param.formula}</div>
                    <div style={{ color:'#475569', fontSize:10 }}>{param.standard}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formula tabs (Diameter / Walls / Eccentricity / …) */}
          <div style={{ padding:'0 20px', borderBottom:'1px solid #1e2330', background:'#0e1015', display:'flex', gap:'2px' }}>
            {formulaGroups.map((g, idx) => (
              <button
                key={g.tab}
                onClick={() => setActiveFormulaTab(idx)}
                style={{
                  padding:'10px 16px',
                  background: activeFormulaTab === idx ? '#111318' : 'transparent',
                  border:'none',
                  borderBottom: activeFormulaTab === idx ? '2px solid #4ade80' : '2px solid transparent',
                  color: activeFormulaTab === idx ? '#4ade80' : '#64748b',
                  fontWeight: activeFormulaTab === idx ? 700 : 500,
                  fontSize:13,
                  cursor:'pointer',
                  marginBottom:-1,
                }}
              >
                {g.tab}
              </button>
            ))}
          </div>

          {/* Formula cards grid */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'16px' }}>
              {formulaGroups[activeFormulaTab].formulas.map((f, idx) => (
                <div key={idx} style={{
                  background:'#111318',
                  border:'1px solid #262d3a',
                  borderRadius:10,
                  padding:'18px',
                  display:'flex',
                  flexDirection:'column',
                  gap:10,
                }}>
                  {/* formula label */}
                  <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>{f.label}</div>

                  {/* formula box */}
                  <div style={{
                    background:'#0a0c0f',
                    border:'1px solid #1e2330',
                    borderRadius:8,
                    padding:'14px',
                    fontFamily:'monospace',
                    fontSize:15,
                    color:'#facc15',
                    letterSpacing:.5,
                    textAlign:'center',
                  }}>
                    {f.latex}
                  </div>

                  {/* standard badge */}
                  {f.standard && (
                    <div style={{ fontSize:10, color:'#4ade80', background:'#052e16', padding:'3px 8px', borderRadius:4, alignSelf:'flex-start' }}>
                      {f.standard}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
