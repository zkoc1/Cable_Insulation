import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { CableIcon } from '../cable/CableIcon';
import { CableCanvas } from '../cable/CableCanvas';
import type { CableTypeCategory } from '../../core/interfaces/cable';

/* ─── EK_2 formül grupları ─── */
const formulaTabs = [
  {
    name: 'Diameter',
    items: [
      { label:'Concentricity (tmin/tmax)',    formula:'(t_min / t_max) × 100%',           std:'IEC 60811-201' },
      { label:'Concentricity (tmin/tavg)',    formula:'(t_min / t_avg) × 100%'                              },
      { label:'Concentricity [VDE]',          formula:'(t_min / t_opposit) × 100%'                          },
      { label:'Concentricity M/L',            formula:'(t_max − t_min) / Di_WPs × 100%'                     },
      { label:'Concentricity [ISO 1101] %',   formula:'(w_min / w_max) × 100%',           std:'ISO 1101'    },
      { label:'MPa − MPi  (Pressure diff)',   formula:'M_Pa − M_Pi',                       std:'ISO 1101'    },
    ],
  },
  {
    name: 'Walls',
    items: [
      { label:'Wall thickness min',           formula:'t_min = min(t₁, t₂, …, t₆)'                         },
      { label:'Wall thickness avg',           formula:'t_avg = Σtᵢ / n'                                      },
      { label:'Wall thickness max',           formula:'t_max = max(t₁, t₂, …, t₆)'                         },
      { label:'Wall thickness single value',  formula:'tᵢ = (D_outer − D_inner) / 2'                        },
      { label:'Diameter inner (WPs)',         formula:'D_inner = 2 × r_inner         [mm]'                  },
      { label:'Diameter outer avg (contour)', formula:'D_outer = 2 × r_outer_avg     [mm]'                  },
    ],
  },
  {
    name: 'Eccentricity',
    items: [
      { label:'Eccentricity (tmax)',          formula:'(t_max / t_min) × 100%'                              },
      { label:'Eccentricity (tavg)',          formula:'(t_avg / t_min) × 100%'                              },
      { label:'Eccentricity [VDE]',           formula:'(t_opposit / t_min) × 100%'                          },
      { label:'Eccentricity M/L',             formula:'(t_max − t_min) / D_error × 100%'                    },
      { label:'Eccentricity [ASTM D4565]',    formula:'(t_max − t_min) / t_avg × 100%',    std:'ASTM D4565' },
      { label:'Eksen kaçıklığı |O1−O2|',      formula:'e = √((x₁−x₂)² + (y₁−y₂)²)  [mm]', std:'TS EN 60811'},
    ],
  },
  {
    name: 'Concentricities',
    items: [
      { label:'Centricity',                   formula:'(1 − Konz) × 100%'                                   },
      { label:'Centricity tavg',              formula:'(1 − Konz_avg) × 100%'                               },
      { label:'Centricity [VDE]',             formula:'(1 − Konz_VDE) × 100%'                               },
      { label:'Centricity M/L',               formula:'(1 − Konz_ML) × 100%'                                },
    ],
  },
  {
    name: 'Distances & Forms',
    items: [
      { label:'Uncentricity',                 formula:'(t_avg − t_min) / 2    [mm]'                         },
      { label:'Uncentricity tavg',            formula:'(t_opposit − t_min) / 2 [mm]'                        },
      { label:'Uncentricity [IAA]',           formula:'(t_opposit − t_min)     [mm]'                        },
      { label:'Ovalite',                      formula:'(D_max − D_min) / D_avg × 100%',  std:'TS EN 60811-201' },
      { label:'Çıkıntı Boyu — AER (Çb)',      formula:'Çb = h_çıkıntı − h_nominal  [mm]', std:'TS 11654'   },
      { label:'Çıkıntılar arası mesafe (Çm)', formula:'Çm = arc(Ö₁, Ö₂) mesafesi   [mm]', std:'TS 11654'  },
    ],
  },
  {
    name: 'Areas & Volumes',
    items: [
      { label:'Cross-section real area',      formula:'A = π × r² (contour − inner)  [mm²]'                 },
      { label:'Cross-section area total',     formula:'A_total = π × (D_outer/2)²    [mm²]'                 },
      { label:'Wall area',                    formula:'A_wall = A_total − A_inner     [mm²]'                 },
    ],
  },
];

/* ─── Kablo başına EK_2 parametreleri ─── */
const cableParamMap: Record<string, { name:string; formula:string; std:string }[]> = {
  XLPE_HV: [
    { name:'tmin_xlpe',     formula:'min 6-nokta XLPE duvar kalınlığı', std:'TS EN 60811-201' },
    { name:'tmax_xlpe',     formula:'max XLPE duvar kalınlığı',          std:'TS EN 60811-201' },
    { name:'tmin_ic',       formula:'İç yarı iletken min. kalınlık',     std:'TS EN 60811-201' },
    { name:'tmax_ic',       formula:'İç yarı iletken max. kalınlık',     std:'TS EN 60811-201' },
    { name:'tmin_dis',      formula:'Dış yarı iletken min. kalınlık',    std:'TS EN 60811-201' },
    { name:'tmax_dis',      formula:'Dış yarı iletken max. kalınlık',    std:'TS EN 60811-201' },
    { name:'eccentricity',  formula:'|O1−O2| / (D_outer/2) × 100%',     std:'TS EN 60811'     },
    { name:'ovality',       formula:'(D_max−D_min)/D_avg × 100%',       std:'TS EN 60811-201' },
  ],
  TESISAT_SINGLE_COLOR: [
    { name:'tmin',          formula:'min izolasyon kalınlığı',           std:'TS EN 50525-1' },
    { name:'tmax',          formula:'max izolasyon kalınlığı',           std:'TS EN 50525-1' },
    { name:'O1',            formula:'Dış çember ağırlık merkezi',        std:'TS EN 50525-1' },
    { name:'O2',            formula:'İzolasyon ağırlık merkezi',         std:'TS EN 50525-1' },
    { name:'y1',            formula:'Sarı yay uzunluğu (arc length)',    std:'TS EN 50525-1' },
    { name:'y2',            formula:'Yeşil yay uzunluğu (arc length)',   std:'TS EN 50525-1' },
    { name:'renk_orani',    formula:'y1/(y1+y2)×100% ≥ 30%',            std:'TS EN 50525-1' },
    { name:'eksen_kacik.',  formula:'|O1−O2|  [mm]',                    std:'TS EN 50525-1' },
  ],
  TESISAT_MULTI_CORE: [
    { name:'t1', formula:'1. damar duvar kalınlığı min.',   std:'TS EN 60811-202' },
    { name:'t2', formula:'2. damar duvar kalınlığı min.',   std:'TS EN 60811-202' },
    { name:'t3', formula:'3. damar duvar kalınlığı min.',   std:'TS EN 60811-202' },
    { name:'O1', formula:'Dış kılıf merkezi',               std:'TS EN 60811-202' },
    { name:'O2', formula:'İzolasyon merkezi',               std:'TS EN 60811-202' },
    { name:'eksen_kacik.', formula:'|O1−O2|  [mm]',        std:'TS EN 60811-202' },
  ],
  TESISAT_NYAF_SOM: [
    { name:'tmin',         formula:'min izolasyon kalınlığı',    std:'TS EN 60811-202' },
    { name:'O1',           formula:'Dış çember merkezi',         std:'TS EN 60811-202' },
    { name:'O2',           formula:'İletken merkezi',            std:'TS EN 60811-202' },
    { name:'ic_cap',       formula:'D_inner (WPs)  [mm]',        std:'TS EN 60811-202' },
    { name:'dis_cap',      formula:'D_outer (contour)  [mm]',   std:'TS EN 60811-202' },
    { name:'eksen_kacik.', formula:'|O1−O2|  [mm]',             std:'TS EN 60811-202' },
  ],
  AER: [
    { name:'tmin',        formula:'min izolasyon kalınlığı', std:'TS 11654' },
    { name:'tmax',        formula:'max izolasyon kalınlığı', std:'TS 11654' },
    { name:'O1',          formula:'İletken ağırlık merkezi', std:'TS 11654' },
    { name:'O2',          formula:'İzolasyon ağırlık merkezi',std:'TS 11654'},
    { name:'Çb',          formula:'Çıkıntı boyu  [mm]',      std:'TS 11654' },
    { name:'Çm',          formula:'Çıkıntılar arası mesafe [mm]', std:'TS 11654' },
    { name:'eksen_kacik.',formula:'|O1−O2|  [mm]',           std:'TS 11654' },
  ],
  NYIF: [
    { name:'tmin', formula:'min izolasyon kalınlığı', std:'TS EN 60811-202' },
    { name:'tmax', formula:'max izolasyon kalınlığı', std:'TS EN 60811-202' },
    { name:'y1',   formula:'Köprü genişliği  [mm]',   std:'TS EN 60811-202' },
    { name:'y2',   formula:'Köprü yüksekliği [mm]',  std:'TS EN 60811-202' },
  ],
  YASSI_TTR: [
    { name:'t1–t6', formula:'6 noktada duvar kalınlığı', std:'TS EN 60811-202' },
    { name:'t7–t8', formula:'2 ek ölçüm noktası',        std:'TS EN 60811-202' },
    { name:'y1',    formula:'Kablo yüksekliği [mm]',     std:'TS EN 60811-202' },
    { name:'y2',    formula:'Kablo genişliği  [mm]',     std:'TS EN 60811-202' },
  ],
  SEKTOR: [
    { name:'tmin',         formula:'min izolasyon kalınlığı',    std:'TS EN 60811-202' },
    { name:'O1',           formula:'İletken ağırlık merkezi',    std:'TS EN 60811-202' },
    { name:'O2',           formula:'Yalıtım ağırlık merkezi',   std:'TS EN 60811-202' },
    { name:'eksen_kacik.', formula:'|O1−O2|  [mm]',             std:'TS EN 60811-202' },
  ],
};

export const AdminScreen: React.FC = () => {
  const { lang, setActiveScreen } = useAppStore();
  const [activeTab, setActiveTab] = useState(0);
  const [activeCable, setActiveCable] = useState<CableTypeCategory | null>(null);

  const cableParams = activeCable ? (cableParamMap[activeCable] ?? []) : [];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 62px)', background:'#f0f2f0' }}>

      {/* Üst çubuk */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 16px', background:'#fff', borderBottom:'2px solid #4caf50',
      }}>
        {/* Formül sekmeleri — tıpkı VELOX'taki gibi */}
        <div style={{ display:'flex', gap:2 }}>
          {formulaTabs.map((tab, idx) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(idx)}
              style={{
                padding:'7px 18px',
                background: activeTab === idx ? '#fff' : '#e8ebe8',
                border:`1px solid ${activeTab === idx ? '#4caf50' : '#d0d7d0'}`,
                borderBottom: activeTab === idx ? '2px solid #fff' : '1px solid #d0d7d0',
                color: activeTab === idx ? '#2e7d32' : '#445544',
                fontWeight: activeTab === idx ? 700 : 500,
                fontSize:13, cursor:'pointer', borderRadius:'6px 6px 0 0',
                marginBottom: activeTab === idx ? -2 : 0,
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <button onClick={() => setActiveScreen('measurement')} style={{
          padding:'6px 14px', background:'#e8ebe8', border:'1px solid #d0d7d0',
          borderRadius:5, color:'#445544', fontWeight:600, fontSize:12,
        }}>← Geri</button>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ── Sol: Formül grid (beyaz arka plan) ── */}
        <div style={{ flex:1, overflowY:'auto', padding:20, background:'#fff' }}>
          {activeCable && (
            <div style={{
              marginBottom:16, padding:'12px 16px',
              background:'#e8f5e9', border:'1px solid #c8e6c9',
              borderRadius:8,
            }}>
              <div style={{ color:'#2e7d32', fontWeight:700, fontSize:13, marginBottom:8 }}>
                📋 {CABLE_PROFILES.find(p=>p.id===activeCable)?.[lang==='tr'?'nameTr':'nameEn']} — Ölçüm Parametreleri (EK_2)
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {cableParams.map((p, i) => (
                  <div key={i} style={{
                    background:'#fff', border:'1px solid #c8e6c9', borderRadius:6, padding:'8px 12px',
                  }}>
                    <div style={{ color:'#1565c0', fontWeight:700, fontSize:12 }}>{p.name}</div>
                    <div style={{ color:'#445544', fontSize:11, fontFamily:'monospace', margin:'3px 0' }}>{p.formula}</div>
                    <div style={{ color:'#81c784', fontSize:9 }}>{p.std}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VELOX tarzı formül kartları — beyaz kart, kırmızı formül metni */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
            gap:12,
          }}>
            {formulaTabs[activeTab].items.map((item, idx) => (
              <div key={idx} style={{
                background:'#fff',
                border:'1px solid #d8ddd8',
                borderRadius:8,
                padding:'16px',
                boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
              }}>
                {/* Formül — kırmızı renkte, VELOX'taki gibi */}
                <div style={{
                  fontSize:16,
                  fontWeight:700,
                  color:'#c62828',
                  fontFamily:'serif',
                  textAlign:'center',
                  padding:'10px 4px',
                  borderBottom:'1px solid #f0f0f0',
                  marginBottom:8,
                  letterSpacing:.3,
                }}>
                  {item.formula}
                </div>
                <div style={{ fontSize:11, color:'#445544', textAlign:'center', fontWeight:600 }}>
                  {item.label}
                </div>
                {item.std && (
                  <div style={{
                    marginTop:6, fontSize:9, color:'#2e7d32', background:'#e8f5e9',
                    padding:'2px 6px', borderRadius:3, textAlign:'center',
                  }}>
                    {item.std}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Sağ: Kablo tipi listesi + mini canvas ── */}
        <div style={{
          width:300, borderLeft:'1px solid #d0d7d0', background:'#f8faf8',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          {/* Kablo tipi sekmeleri (Round 1L / Round 2L tarzı) */}
          <div style={{
            padding:'8px 10px', background:'#e8ebe8',
            borderBottom:'1px solid #d0d7d0', display:'flex', flexWrap:'wrap', gap:4,
          }}>
            {CABLE_PROFILES.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveCable(activeCable === p.id as CableTypeCategory ? null : p.id as CableTypeCategory)}
                style={{
                  padding:'4px 10px', fontSize:10, fontWeight:700,
                  background: activeCable === p.id ? '#4caf50' : '#fff',
                  border:`1px solid ${activeCable === p.id ? '#4caf50' : '#d0d7d0'}`,
                  color: activeCable === p.id ? '#fff' : '#445544',
                  borderRadius:4, cursor:'pointer',
                }}
              >
                {p.id.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Seçili kablo canvas önizlemesi */}
          <div style={{
            background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center',
            padding:12, borderBottom:'1px solid #2a2a2a',
          }}>
            {activeCable
              ? <CableCanvas cableType={activeCable} width={260} height={200}/>
              : <div style={{ color:'#555', fontSize:11 }}>Kablo tipine tıkla</div>
            }
          </div>

          {/* Kablo listesi */}
          <div style={{ overflowY:'auto', flex:1 }}>
            {CABLE_PROFILES.map(p => {
              const active = activeCable === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveCable(active ? null : p.id as CableTypeCategory)}
                  style={{
                    display:'flex', alignItems:'center', gap:10, width:'100%',
                    padding:'10px 12px', border:'none',
                    borderBottom:'1px solid #e8ebe8',
                    background: active ? '#e8f5e9' : 'transparent',
                    borderLeft: active ? '3px solid #4caf50' : '3px solid transparent',
                    cursor:'pointer', textAlign:'left',
                  }}
                >
                  <CableIcon type={p.id as CableTypeCategory}/>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color: active ? '#2e7d32' : '#1a2a1a' }}>
                      {lang === 'tr' ? p.nameTr : p.nameEn}
                    </div>
                    <div style={{ fontSize:9, color:'#778877' }}>{p.standard}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
