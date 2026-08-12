import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CableIcon } from '../cable/CableIcon';
import type { CableTypeCategory } from '../../core/interfaces/cable';

import {
  FormulaService,
  EK2_MASTER_FORMULA_CATALOG,
  DEFAULT_FORMULAS,
  type Formula,
} from '../../services/FormulaService';

export const AdminScreen: React.FC = () => {
  const { lang, setActiveScreen } = useAppStore();
  const t = translations[lang];

  const [formulas, setFormulas] = useState<Record<string, Formula[]>>(() => FormulaService.loadAllFormulas());
  const [activeCable, setActiveCable] = useState<CableTypeCategory>('XLPE_HV' as CableTypeCategory);

  // Status notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom formula add form state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newExpr, setNewExpr] = useState('');
  const [newStd, setNewStd] = useState('');

  const activeFormulas: Formula[] = formulas[activeCable] ?? [];
  const activeCableProfile = CABLE_PROFILES.find(p => p.id === activeCable);

  // Check if a specific formula is active for selected cable type
  const isFormulaActive = (formulaId: string) => {
    return activeFormulas.some(f => f.id === formulaId);
  };

  // Toggle formula ON / OFF (Ekle / Çıkart)
  const toggleFormula = (formula: Formula) => {
    const active = isFormulaActive(formula.id);
    let updatedList: Formula[];
    if (active) {
      updatedList = activeFormulas.filter(f => f.id !== formula.id);
    } else {
      updatedList = [...activeFormulas, { ...formula, enabled: true }];
    }

    setFormulas(prev => ({
      ...prev,
      [activeCable]: updatedList,
    }));
  };

  // Select all formulas in master catalog for active cable category
  const selectAllFormulas = () => {
    const allFormulas = EK2_MASTER_FORMULA_CATALOG.flatMap(c => c.formulas);
    setFormulas(prev => ({
      ...prev,
      [activeCable]: allFormulas,
    }));
  };

  // Reset to default formulas for active cable type
  const resetToDefaults = () => {
    setFormulas(prev => ({
      ...prev,
      [activeCable]: DEFAULT_FORMULAS[activeCable] ?? [],
    }));
    showToast('Varsayılan EK_2 formül kümesine sıfırlandı.');
  };

  // Explicitly Save formulas to localStorage
  const handleSave = () => {
    FormulaService.saveAllFormulas(formulas);
    showToast('✓ Formüller başarıyla kaydedildi ve ölçüm sistemine aktarıldı!');
  };

  // Add custom formula
  const addCustomFormula = () => {
    if (!newLabel.trim() || !newExpr.trim()) return;
    const customFormula: Formula = {
      id: `custom_${Date.now()}`,
      category: activeCable,
      label: newLabel.trim(),
      expression: newExpr.trim(),
      standard: newStd.trim() || activeCableProfile?.standard || 'Özel Standard',
      enabled: true,
    };

    setFormulas(prev => ({
      ...prev,
      [activeCable]: [...(prev[activeCable] || []), customFormula],
    }));

    setNewLabel('');
    setNewExpr('');
    setNewStd('');
    setShowAddCustom(false);
    showToast('Özel formül listeye eklendi. Kaydetmeyi unutmayın.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)', background: '#f4f6f4' }}>

      {/* Üst Bar */}
      <div style={{
        padding: '10px 20px', background: '#fff',
        borderBottom: '2px solid #3d8b40',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚙</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2a1a' }}>
              {t.adminPanel} — Formül & Ölçüm Yapılandırma
            </div>
            <div style={{ fontSize: 11, color: '#666' }}>
              EK_2 standart formül kütüphanesinden formül ekleyin/çıkartın ve kaydedin
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {toastMessage && (
            <div style={{
              background: '#e8f5e9', border: '1px solid #43a047', color: '#2e7d32',
              fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 4,
              animation: 'fadeIn 0.3s ease',
            }}>
              {toastMessage}
            </div>
          )}

          <button
            onClick={handleSave}
            style={{
              padding: '7px 18px', background: '#2e7d32', border: 'none',
              borderRadius: 5, color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 4px rgba(46,125,50,0.3)',
            }}
          >
            <span>💾</span> KAYDET (Kaydet & Aktar)
          </button>

          <button onClick={() => setActiveScreen('measurement')} style={{
            padding: '7px 14px', background: '#f0f2f0', border: '1px solid #c8d0c8',
            borderRadius: 5, fontSize: 12, fontWeight: 600, color: '#4a5a4a', cursor: 'pointer',
          }}>← Ölçüm Ekranına Dön</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sol Panel: Kablo Tipleri Listesi ── */}
        <div style={{ width: 280, borderRight: '1px solid #d0d8d0', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#5a6a5a', borderBottom: '1px solid #e8ebe8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Kablo Kategorileri
          </div>

          {/* Mini canvas önizleme - seçili kablo */}
          <div style={{ background: '#f8f9fa', borderBottom: '1px solid #e8ebe8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
            <CableCanvas cableType={activeCable} width={180} height={130} thumbnail />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2e7d32', marginTop: 6 }}>
              {activeCableProfile ? (lang === 'tr' ? activeCableProfile.nameTr : activeCableProfile.nameEn) : ''}
            </div>
            <div style={{ fontSize: 10, color: '#7a8a7a' }}>{activeCableProfile?.standard}</div>
          </div>

          {/* Kablo listesi */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {CABLE_PROFILES.map(p => {
              const active = activeCable === p.id;
              const count = (formulas[p.id] ?? []).length;
              return (
                <button
                  key={p.id}
                  onClick={() => { setActiveCable(p.id as CableTypeCategory); setShowAddCustom(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 12px', border: 'none', borderBottom: '1px solid #eee',
                    background: active ? '#e8f5e9' : 'transparent',
                    borderLeft: `4px solid ${active ? '#2e7d32' : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <CableIcon type={p.id as CableTypeCategory} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: active ? 700 : 600, color: active ? '#2e7d32' : '#1a2a1a' }}>
                      {lang === 'tr' ? p.nameTr : p.nameEn}
                    </div>
                    <div style={{ fontSize: 10, color: '#7a8a7a' }}>{p.standard}</div>
                  </div>
                  <div style={{
                    background: active ? '#2e7d32' : '#e0e0e0', color: active ? '#fff' : '#444',
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                  }}>
                    {count}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sağ Panel: Formül Seçim Paneli (Kategorize) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

          {/* Kablo başlığı & Toplu Ekle/Çıkart Butonları */}
          <div style={{
            padding: '12px 20px', background: '#f8faf8',
            borderBottom: '1px solid #e0e5e0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2a1a' }}>
                {activeCableProfile ? (lang === 'tr' ? activeCableProfile.nameTr : activeCableProfile.nameEn) : ''} için Aktif Formüller
              </div>
              <div style={{ fontSize: 11, color: '#556655', marginTop: 2 }}>
                Bu kablo tipi seçildiğinde ekrandaki optik ölçüm bu {activeFormulas.length} formüle göre hesaplanacaktır.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={resetToDefaults} style={{
                padding: '6px 12px', background: '#fff', border: '1px solid #c8d0c8',
                borderRadius: 4, fontSize: 11, color: '#4a5a4a', cursor: 'pointer',
              }}>↺ Varsayılana Dön</button>
              
              <button onClick={selectAllFormulas} style={{
                padding: '6px 12px', background: '#fff', border: '1px solid #c8d0c8',
                borderRadius: 4, fontSize: 11, color: '#1b5e20', fontWeight: 600, cursor: 'pointer',
              }}>✓ Tümünü Seç</button>

              <button onClick={() => setShowAddCustom(!showAddCustom)} style={{
                padding: '6px 14px', background: '#f0f4f0', border: '1px solid #a5d6a7',
                borderRadius: 4, color: '#2e7d32', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}>+ Özel Formül Ekle</button>
            </div>
          </div>

          {/* Özel formül ekleme formu */}
          {showAddCustom && (
            <div style={{
              padding: '14px 20px', background: '#e8f5e9',
              borderBottom: '1px solid #a5d6a7',
              display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end',
            }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#2e7d32' }}>{t.formulaLabel}</label>
                <input
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="örn: tmin_xlpe"
                  style={{ padding: '6px 10px', border: '1px solid #a5d6a7', borderRadius: 4, fontSize: 12, width: 180 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#2e7d32' }}>{t.formulaExpr}</label>
                <input
                  value={newExpr}
                  onChange={e => setNewExpr(e.target.value)}
                  placeholder="örn: (tmax-tmin)/tmax × 100"
                  style={{ padding: '6px 10px', border: '1px solid #a5d6a7', borderRadius: 4, fontSize: 12, width: 260 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#2e7d32' }}>{t.formulaStd}</label>
                <input
                  value={newStd}
                  onChange={e => setNewStd(e.target.value)}
                  placeholder="TS EN 60811-201"
                  style={{ padding: '6px 10px', border: '1px solid #a5d6a7', borderRadius: 4, fontSize: 12, width: 160 }}
                />
              </div>
              <button onClick={addCustomFormula} style={{
                padding: '7px 18px', background: '#2e7d32', border: 'none',
                borderRadius: 4, color: '#fff', fontWeight: 700, fontSize: 12, height: 34, cursor: 'pointer',
              }}>Listeye Ekle</button>
              <button onClick={() => setShowAddCustom(false)} style={{
                padding: '7px 14px', background: '#fff', border: '1px solid #c8d0c8',
                borderRadius: 4, fontSize: 12, color: '#4a5a4a', height: 34, cursor: 'pointer',
              }}>{t.cancel}</button>
            </div>
          )}

          {/* Formül Seçim Paneli: EK_2 Master Kütüphane Kategorileri */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {EK2_MASTER_FORMULA_CATALOG.map(category => (
              <div key={category.id} style={{ marginBottom: 24 }}>

                {/* Kategori Başlığı */}
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#2e7d32',
                  paddingBottom: 6, marginBottom: 12,
                  borderBottom: '2px solid #e8f5e9',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>📐</span>
                  <span>{lang === 'tr' ? category.titleTr : category.titleEn}</span>
                </div>

                {/* Kategoriye ait Formül Kartları */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {category.formulas.map(formula => {
                    const active = isFormulaActive(formula.id);
                    return (
                      <div
                        key={formula.id}
                        onClick={() => toggleFormula(formula)}
                        style={{
                          background: active ? '#fff' : '#fafafa',
                          border: `2px solid ${active ? '#3d8b40' : '#e0e0e0'}`,
                          borderRadius: 8, padding: '12px 14px',
                          boxShadow: active ? '0 2px 6px rgba(61,139,64,0.15)' : 'none',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          display: 'flex', flexDirection: 'column', gap: 8,
                          position: 'relative',
                        }}
                      >
                        {/* Sol Üst Checkbox Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => {}} // handled by parent onClick
                              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#2e7d32' }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#1a2a1a' : '#777' }}>
                              {formula.label}
                            </span>
                          </div>

                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                            background: active ? '#e8f5e9' : '#f0f0f0',
                            color: active ? '#2e7d32' : '#888',
                          }}>
                            {active ? 'EKLE' : 'ÇIKART'}
                          </span>
                        </div>

                        {/* Kırmızı Büyük Formül İfadesi (EK_2 & VELOX stili) */}
                        <div style={{
                          fontSize: 15, fontWeight: 700,
                          color: active ? '#c62828' : '#9e9e9e',
                          fontFamily: 'Cambria, Georgia, serif',
                          padding: '6px 0',
                          textAlign: 'center',
                          letterSpacing: 0.3,
                          background: active ? '#fff8f8' : '#f5f5f5',
                          borderRadius: 4,
                          border: `1px solid ${active ? '#ffebee' : '#eee'}`,
                        }}>
                          {formula.expression}
                        </div>

                        {/* Standart Etiketi */}
                        {formula.standard && (
                          <div style={{ fontSize: 9, color: '#2e7d32', fontWeight: 600, textAlign: 'right' }}>
                            {formula.standard}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
