import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CableIcon } from '../cable/CableIcon';
import type { CableTypeCategory } from '../../core/interfaces/cable';

// --- Type definitions ---

interface Formula {
  id: string;
  label: string;
  expression: string;
  standard?: string;
}

// Default formulas per cable type, sourced from EK_2
const DEFAULT_FORMULAS: Record<string, Formula[]> = {
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
    { id:'t5', label:'t2_min = min(t₇,t₈)',        expression:'t2min = min(t₇,t₈)', standard:'TS EN 60811-202' },
    { id:'t6', label:'y1 (kablo yüksekliği)',       expression:'y1  [mm]', standard:'TS EN 60811-202' },
    { id:'t7', label:'y2 (kablo genişliği)',        expression:'y2  [mm]', standard:'TS EN 60811-202' },
  ],
  SEKTOR: [
    { id:'sk1', label:'tmin (min kalınlık)',        expression:'tmin = min(t₁,…,t₆)', standard:'TS EN 60811-202' },
    { id:'sk2', label:'Eksen kaçıklığı |O1-O2|',   expression:'e = |O1-O2|  [mm]', standard:'TS EN 60811-202' },
  ],
};

const STORAGE_KEY = 'cable_formulas_v1';

function loadFormulas(): Record<string, Formula[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT_FORMULAS };
  } catch {
    return { ...DEFAULT_FORMULAS };
  }
}

function saveFormulas(data: Record<string, Formula[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const AdminScreen: React.FC = () => {
  const { lang, setActiveScreen } = useAppStore();
  const t = translations[lang];

  const [formulas, setFormulas] = useState<Record<string, Formula[]>>(loadFormulas);
  const [activeCable, setActiveCable] = useState<CableTypeCategory>('XLPE_HV' as CableTypeCategory);

  // Add-formula form state
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newExpr, setNewExpr] = useState('');
  const [newStd, setNewStd] = useState('');

  // persist to localStorage whenever formulas change
  useEffect(() => {
    saveFormulas(formulas);
  }, [formulas]);

  const activeFormulas: Formula[] = formulas[activeCable] ?? [];

  const addFormula = () => {
    if (!newLabel.trim() || !newExpr.trim()) return;
    const updated = {
      ...formulas,
      [activeCable]: [
        ...activeFormulas,
        { id: `custom_${Date.now()}`, label: newLabel.trim(), expression: newExpr.trim(), standard: newStd.trim() || undefined },
      ],
    };
    setFormulas(updated);
    setNewLabel(''); setNewExpr(''); setNewStd('');
    setShowAdd(false);
  };

  const removeFormula = (id: string) => {
    setFormulas({
      ...formulas,
      [activeCable]: activeFormulas.filter(f => f.id !== id),
    });
  };

  const resetToDefaults = () => {
    setFormulas({ ...formulas, [activeCable]: DEFAULT_FORMULAS[activeCable] ?? [] });
  };

  const activeCableProfile = CABLE_PROFILES.find(p => p.id === activeCable);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)', background: '#eef0ee' }}>

      {/* Üst bar */}
      <div style={{
        padding: '8px 16px', background: '#fff',
        borderBottom: '2px solid #3d8b40',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2a1a' }}>
          ⚙ {t.adminPanel} — {t.formulaManagement}
        </div>
        <button onClick={() => setActiveScreen('measurement')} style={{
          padding: '5px 14px', background: '#f0f2f0', border: '1px solid #c8d0c8',
          borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#4a5a4a',
        }}>← Geri</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sol: Kablo tipi listesi ── */}
        <div style={{ width: 260, borderRight: '1px solid #d0d8d0', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#7a8a7a', borderBottom: '1px solid #e8ebe8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Kablo Tipleri
          </div>

          {/* Mini canvas önizleme - seçili kablo */}
          <div style={{ background: '#f8f9fa', borderBottom: '1px solid #e8ebe8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
            <CableCanvas cableType={activeCable} width={180} height={140} thumbnail />
          </div>

          {/* Kablo listesi */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {CABLE_PROFILES.map(p => {
              const active = activeCable === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { setActiveCable(p.id as CableTypeCategory); setShowAdd(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 10px', border: 'none', borderBottom: '1px solid #eee',
                    background: active ? '#e8f5e9' : 'transparent',
                    borderLeft: `3px solid ${active ? '#3d8b40' : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <CableIcon type={p.id as CableTypeCategory} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: active ? '#2e7d32' : '#1a2a1a' }}>
                      {lang === 'tr' ? p.nameTr : p.nameEn}
                    </div>
                    <div style={{ fontSize: 9, color: '#7a8a7a' }}>{p.standard}</div>
                    <div style={{ fontSize: 9, color: '#3d8b40', marginTop: 1 }}>
                      {(formulas[p.id] ?? []).length} formül
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sağ: Formül yönetim paneli ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

          {/* kablo başlığı + butonlar */}
          <div style={{
            padding: '10px 18px', background: '#f8faf8',
            borderBottom: '1px solid #e0e5e0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2a1a' }}>
                {activeCableProfile ? (lang === 'tr' ? activeCableProfile.nameTr : activeCableProfile.nameEn) : ''}
              </div>
              <div style={{ fontSize: 11, color: '#7a8a7a' }}>
                {t.formulaFor} — {activeCableProfile?.standard}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={resetToDefaults} style={{
                padding: '5px 12px', background: '#fff', border: '1px solid #c8d0c8',
                borderRadius: 4, fontSize: 11, color: '#4a5a4a',
              }}>↺ Varsayılana Sıfırla</button>
              <button onClick={() => setShowAdd(!showAdd)} style={{
                padding: '5px 14px', background: '#3d8b40', border: 'none',
                borderRadius: 4, color: '#fff', fontWeight: 700, fontSize: 12,
              }}>+ {t.addFormula}</button>
            </div>
          </div>

          {/* Yeni formül ekleme formu */}
          {showAdd && (
            <div style={{
              padding: '14px 18px', background: '#f1f8f1',
              borderBottom: '1px solid #c8e6c9',
              display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end',
            }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#4a5a4a' }}>{t.formulaLabel}</label>
                <input
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="örn: tmin_xlpe"
                  style={{ padding: '6px 10px', border: '1px solid #c8d0c8', borderRadius: 4, fontSize: 12, width: 160 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#4a5a4a' }}>{t.formulaExpr}</label>
                <input
                  value={newExpr}
                  onChange={e => setNewExpr(e.target.value)}
                  placeholder="örn: (tmax-tmin)/tmax × 100"
                  style={{ padding: '6px 10px', border: '1px solid #c8d0c8', borderRadius: 4, fontSize: 12, width: 250 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#4a5a4a' }}>{t.formulaStd}</label>
                <input
                  value={newStd}
                  onChange={e => setNewStd(e.target.value)}
                  placeholder="TS EN 60811-201"
                  style={{ padding: '6px 10px', border: '1px solid #c8d0c8', borderRadius: 4, fontSize: 12, width: 160 }}
                />
              </div>
              <button onClick={addFormula} style={{
                padding: '7px 18px', background: '#3d8b40', border: 'none',
                borderRadius: 4, color: '#fff', fontWeight: 700, fontSize: 12, height: 34,
              }}>{t.saveFormula}</button>
              <button onClick={() => setShowAdd(false)} style={{
                padding: '7px 14px', background: '#f0f2f0', border: '1px solid #c8d0c8',
                borderRadius: 4, fontSize: 12, color: '#4a5a4a', height: 34,
              }}>{t.cancel}</button>
            </div>
          )}

          {/* Formül listesi — VELOX stili kartlar (beyaz zemin, kırmızı formül ifadesi) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
            {activeFormulas.length === 0 ? (
              <div style={{ color: '#999', fontSize: 13, padding: 20, textAlign: 'center' }}>
                Bu kablo tipi için henüz formül eklenmemiş.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {activeFormulas.map(f => (
                  <div key={f.id} style={{
                    background: '#fff', border: '1px solid #dde0dd',
                    borderRadius: 8, padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {/* Formül ifadesi — EK_2/VELOX'taki gibi kırmızı, büyük */}
                    <div style={{
                      fontSize: 15, fontWeight: 700,
                      color: '#c62828',
                      fontFamily: 'Cambria, Georgia, serif',
                      padding: '8px 0 8px',
                      borderBottom: '1px solid #f0f0f0',
                      textAlign: 'center',
                      letterSpacing: 0.3,
                    }}>
                      {f.expression}
                    </div>

                    {/* etiket + standart + sil butonu */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#445544', fontWeight: 600 }}>{f.label}</div>
                        {f.standard && (
                          <div style={{
                            marginTop: 3, fontSize: 9, color: '#2e7d32',
                            background: '#e8f5e9', padding: '2px 6px', borderRadius: 3, display: 'inline-block',
                          }}>{f.standard}</div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFormula(f.id)}
                        title={t.removeFormula}
                        style={{
                          padding: '3px 9px', background: '#fff5f5',
                          border: '1px solid #ffcdd2', borderRadius: 4,
                          color: '#c62828', fontSize: 11, cursor: 'pointer',
                        }}
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
