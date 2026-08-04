import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CableIcon } from '../cable/CableIcon';
import { MeasurementCalculationService } from '../../services/MeasurementCalculationService';
import type { CableTypeCategory } from '../../core/interfaces/cable';

export const MeasurementScreen: React.FC = () => {
  const { session, lang, selectedCable, setSelectedCable, orderNumber, setOrderNumber, notes, setNotes, setActiveScreen, setCurrentResult } = useAppStore();
  const t = translations[lang];

  const handleStart = () => {
    const result = MeasurementCalculationService.calculate(selectedCable, session.username, orderNumber, notes);
    setCurrentResult(result);
    setActiveScreen('result');
  };

  const selected = CABLE_PROFILES.find(p => p.id === selectedCable);

  return (
    <div style={{ display:'flex', height:'calc(100vh - 60px)', overflow:'hidden' }}>

      {/* ─── Left: Camera / Canvas Area ─── */}
      <div style={{ flex:'1 1 0', display:'flex', flexDirection:'column', padding:'16px', gap:'12px', overflow:'hidden' }}>
        {/* status bar */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px', padding:'8px 14px', background:'#111318', borderRadius:8, border:'1px solid #262d3a' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#facc15', display:'inline-block', boxShadow:'0 0 6px #facc15' }}/>
          <span style={{ color:'#facc15', fontSize:13, fontWeight:600 }}>{t.camInactive}</span>
          <span style={{ color:'#475569', fontSize:12, marginLeft:'auto' }}>VELOX Engine – test image</span>
        </div>

        {/* cross-section canvas */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#0c0e12', borderRadius:10, border:'1px solid #1e2330', overflow:'hidden' }}>
          <CableCanvas cableType={selectedCable} width={520} height={420}/>
        </div>

        {/* selected cable info bar */}
        <div style={{ padding:'10px 14px', background:'#111318', borderRadius:8, border:'1px solid #262d3a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <span style={{ color:'#94a3b8', fontSize:12 }}>Seçili Tip: </span>
            <strong style={{ color:'#4ade80', fontSize:13 }}>{selected ? (lang === 'tr' ? selected.nameTr : selected.nameEn) : ''}</strong>
          </div>
          <div style={{ color:'#475569', fontSize:11 }}>{selected?.standard}</div>
        </div>
      </div>

      {/* ─── Right: Cable Type Grid + Controls ─── */}
      <div style={{ width:340, display:'flex', flexDirection:'column', borderLeft:'1px solid #1e2330', overflow:'hidden' }}>

        {/* Cable type selection header */}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e2330', background:'#0e1015' }}>
          <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:15 }}>{t.cableType}</span>
        </div>

        {/* 2-column grid of cable type cards with SVG icons */}
        <div style={{ padding:'12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', overflowY:'auto', flex:1 }}>
          {CABLE_PROFILES.map((p) => {
            const active = selectedCable === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedCable(p.id as CableTypeCategory)}
                style={{
                  background: active ? '#0f2e1a' : '#111318',
                  border: `2px solid ${active ? '#4ade80' : '#262d3a'}`,
                  borderRadius: 10,
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'border-color .15s',
                }}
              >
                <CableIcon type={p.id as CableTypeCategory}/>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, fontWeight:700, color: active ? '#4ade80' : '#f1f5f9', lineHeight:1.3 }}>
                    {lang === 'tr' ? p.nameTr : p.nameEn}
                  </div>
                  <div style={{ fontSize:9, color:'#475569', marginTop:2 }}>{p.standard}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form area */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid #1e2330', display:'flex', flexDirection:'column', gap:10, background:'#0e1015' }}>
          <div>
            <label style={{ display:'block', color:'#94a3b8', fontSize:12, marginBottom:4 }}>{t.orderNumber}</label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              style={{ width:'100%', padding:'8px 10px', background:'#111318', border:'1px solid #262d3a', borderRadius:6, color:'#fff', fontSize:13 }}
            />
          </div>
          <div>
            <label style={{ display:'block', color:'#94a3b8', fontSize:12, marginBottom:4 }}>{t.notes}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{ width:'100%', padding:'8px 10px', background:'#111318', border:'1px solid #262d3a', borderRadius:6, color:'#fff', fontSize:12, resize:'none' }}
            />
          </div>
          <button
            onClick={handleStart}
            style={{ padding:'12px', background:'#4ade80', border:'none', borderRadius:8, color:'#051007', fontWeight:800, fontSize:15, letterSpacing:.5 }}
          >
            ▶ {t.startMeasurement}
          </button>
        </div>
      </div>
    </div>
  );
};
