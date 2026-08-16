import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { CableIcon } from '../cable/CableIcon';
import type { CableTypeCategory } from '../../core/interfaces/cable';

import {
  FormulaService,
  EK2_MASTER_FORMULA_CATALOG,
  DEFAULT_FORMULAS,
  type Formula,
  type FormulaCategoryDef,
} from '../../services/FormulaService';

export const AdminScreen: React.FC = () => {
  const { lang, setActiveScreen } = useAppStore();

  const [formulas, setFormulas] = useState<Record<string, Formula[]>>(() => FormulaService.loadAllFormulas());

  const [activeCable, setActiveCable] = useState<CableTypeCategory>('XLPE_HV' as CableTypeCategory);
  const [activeTab, setActiveTab] = useState<FormulaCategoryDef['id']>('WALLS');

  // Status notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Reset to default formulas for active cable type
  const resetToDefaults = () => {
    setFormulas(prev => ({
      ...prev,
      [activeCable]: DEFAULT_FORMULAS[activeCable] ?? [],
    }));
    showToast('Varsayılan VELOX / EK_2 parametre planına sıfırlandı.');
  };

  // Explicitly Save formulas to localStorage
  const handleSave = () => {
    FormulaService.saveAllFormulas(formulas);
    showToast('✓ Parametreler başarıyla kaydedildi ve test planına aktarıldı!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Active category definition
  const currentCategory = EK2_MASTER_FORMULA_CATALOG.find(c => c.id === activeTab) || EK2_MASTER_FORMULA_CATALOG[2];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)', background: '#eef0ee' }}>

      {/* Üst Bar: VELOX Parameter Categories (Image 1) */}
      <div style={{
        background: '#e0e0e0', borderBottom: '2px solid #3d8b40',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px',
      }}>
        {/* Horizontal Category Tabs matching Image 1 */}
        <div style={{ display: 'flex', gap: 2 }}>
          {EK2_MASTER_FORMULA_CATALOG.map(cat => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{
                  padding: '10px 18px',
                  background: isActive ? '#fff' : '#d6d6d6',
                  color: isActive ? '#1b5e20' : '#444',
                  fontWeight: 700, fontSize: 12, border: 'none',
                  borderTop: isActive ? '3px solid #3d8b40' : '3px solid transparent',
                  borderRight: '1px solid #ccc',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                {cat.id === 'DIAMETER' && 'Diameter'}
                {cat.id === 'DISTANCES_FORMS' && 'Distances & Forms'}
                {cat.id === 'WALLS' && 'Walls'}
                {cat.id === 'AREAS_VOLUMES' && 'Areas & Volumes'}
                {cat.id === 'CONCENTRICITIES' && 'Concentricities'}
                {cat.id === 'OTHERS' && 'Others'}
              </button>
            );
          })}
        </div>

        {/* Save & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
          {toastMessage && (
            <div style={{
              background: '#e8f5e9', border: '1px solid #43a047', color: '#2e7d32',
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
            }}>
              {toastMessage}
            </div>
          )}

          <button
            onClick={handleSave}
            style={{
              padding: '6px 16px', background: '#2e7d32', border: 'none',
              borderRadius: 4, color: '#fff', fontWeight: 700, fontSize: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 2px 4px rgba(46,125,50,0.3)',
            }}
          >
            💾 KAYDET
          </button>

          <button onClick={() => setActiveScreen('measurement')} style={{
            padding: '6px 12px', background: '#fff', border: '1px solid #bbb',
            borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#333', cursor: 'pointer',
          }}>← Ölçüm Ekranı</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sol: Parameter Catalog Library Grid for Selected Tab (Image 1 Left Side) ── */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f4f6f4' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📐 {lang === 'tr' ? currentCategory.titleTr : currentCategory.titleEn}</span>
            <span style={{ fontSize: 11, color: '#666', fontWeight: 400 }}>Tıklayarak test planına ekleyin/çıkartın</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {currentCategory.formulas.map(formula => {
              const active = isFormulaActive(formula.id);
              return (
                <div
                  key={formula.id}
                  onClick={() => toggleFormula(formula)}
                  style={{
                    background: active ? '#fff' : '#f9f9f9',
                    border: `2px solid ${active ? '#3d8b40' : '#ccc'}`,
                    borderRadius: 6, padding: '12px 14px',
                    boxShadow: active ? '0 2px 6px rgba(61,139,64,0.18)' : 'none',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 110,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#1b5e20' : '#444' }}>
                      {formula.label}
                    </div>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {}}
                      style={{ accentColor: '#2e7d32', width: 16, height: 16, cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{
                    fontSize: 13, fontWeight: 700, color: active ? '#c62828' : '#777',
                    fontFamily: 'Cambria, Georgia, serif', textAlign: 'center', margin: '8px 0',
                    padding: '4px', background: active ? '#fff8f8' : '#eee', borderRadius: 4,
                  }}>
                    {formula.expression}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9, color: '#666' }}>
                    <span>{formula.standard}</span>
                    <span style={{
                      fontWeight: 800, padding: '1px 6px', borderRadius: 3,
                      background: active ? '#e8f5e9' : '#e0e0e0', color: active ? '#2e7d32' : '#666',
                    }}>
                      {active ? 'AKTİF' : 'PASİF'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sağ: Test Plan / Active Cable Configuration Table (Image 1 Right Side) ── */}
        <div style={{ width: 380, borderLeft: '2px solid #ccc', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Test plan header & Cable selection buttons (Image 1 Top Right) */}
          <div style={{ padding: '8px 12px', background: '#f8faf8', borderBottom: '1px solid #ddd' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>
              Seçili Test Planı (Kablo Tipi)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {CABLE_PROFILES.map(p => {
                const active = activeCable === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveCable(p.id as CableTypeCategory)}
                    style={{
                      padding: '6px 4px', borderRadius: 4,
                      background: active ? '#e8f5e9' : '#fff',
                      border: `1.5px solid ${active ? '#3d8b40' : '#ccc'}`,
                      color: active ? '#2e7d32' : '#555', fontWeight: 700, fontSize: 9,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      boxShadow: active ? '0 1px 4px rgba(61,139,64,0.2)' : 'none',
                    }}
                  >
                    <CableIcon type={p.id as CableTypeCategory} />
                    <span style={{ fontSize: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                      {p.id.replace(/_/g, ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Cable Details Header */}
          <div style={{ padding: '10px 14px', background: '#2e7d32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {activeCableProfile ? (lang === 'tr' ? activeCableProfile.nameTr : activeCableProfile.nameEn) : ''}
              </div>
              <div style={{ fontSize: 10, opacity: 0.9 }}>{activeCableProfile?.standard}</div>
            </div>
            <button onClick={resetToDefaults} style={{
              padding: '3px 8px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 3, color: '#fff', fontSize: 10, cursor: 'pointer',
            }}>↺ Sıfırla</button>
          </div>

          {/* Test Plan Table matching Image 1 Right Table */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{
              background: '#f0f2f0', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#555',
              display: 'grid', gridTemplateColumns: '30px 1fr 70px', borderBottom: '1px solid #ddd',
            }}>
              <span>#</span>
              <span>Parametre Adı</span>
              <span style={{ textAlign: 'right' }}>Kategori</span>
            </div>

            {activeFormulas.length === 0 ? (
              <div style={{ color: '#999', fontSize: 12, padding: 20, textAlign: 'center' }}>
                Bu kablo için henüz parametre seçilmedi. Soldaki kütüphaneden parametre seçin.
              </div>
            ) : (
              activeFormulas.map((f, idx) => (
                <div
                  key={f.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '30px 1fr 70px',
                    padding: '8px 10px', borderBottom: '1px solid #eee', alignItems: 'center',
                    fontSize: 11, background: idx % 2 === 0 ? '#fff' : '#fafafa',
                  }}
                >
                  <span style={{ color: '#888', fontWeight: 700 }}>{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a2a1a' }}>{f.label}</div>
                    <div style={{ fontSize: 9, color: '#c62828', fontFamily: 'serif' }}>{f.expression}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 9, background: '#e8f5e9', color: '#2e7d32', padding: '2px 5px', borderRadius: 3, fontWeight: 700 }}>
                      {f.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer stats */}
          <div style={{ padding: '8px 12px', background: '#f8faf8', borderTop: '1px solid #ddd', fontSize: 11, color: '#555', display: 'flex', justifyContent: 'space-between' }}>
            <span>Toplam Parametre: <strong>{activeFormulas.length}</strong></span>
            <span>Uyum: <strong>TS EN 60811</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
};
