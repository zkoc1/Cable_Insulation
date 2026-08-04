import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CableIcon } from '../cable/CableIcon';
import { MeasurementCalculationService } from '../../services/MeasurementCalculationService';
import type { CableTypeCategory } from '../../core/interfaces/cable';

export const MeasurementScreen: React.FC = () => {
  const {
    session, lang, selectedCable, setSelectedCable,
    orderNumber, setOrderNumber, notes, setNotes,
    setActiveScreen, setCurrentResult,
  } = useAppStore();
  const t = translations[lang];

  const selected = CABLE_PROFILES.find(p => p.id === selectedCable);

  const handleStart = () => {
    const result = MeasurementCalculationService.calculate(
      selectedCable, session.username, orderNumber, notes
    );
    setCurrentResult(result);
    setActiveScreen('result');
  };

  return (
    <div style={{ display:'flex', height:'calc(100vh - 62px)', background:'#f0f2f0' }}>

      {/* ── Sol: Kamera / Kesit Görüntüsü ── */}
      <div style={{ flex:'1 1 0', display:'flex', flexDirection:'column', background:'#1a1a1a', minWidth:0 }}>
        {/* Status bar */}
        <div style={{
          height:32, background:'#111', display:'flex', alignItems:'center',
          padding:'0 14px', gap:10, borderBottom:'1px solid #2a2a2a',
        }}>
          <span style={{
            width:8, height:8, borderRadius:'50%',
            background:'#ffb300', display:'inline-block',
            boxShadow:'0 0 6px #ffb300',
          }}/>
          <span style={{ color:'#ffb300', fontSize:11, fontWeight:600 }}>{t.camInactive}</span>
          <span style={{ color:'#555', fontSize:11, marginLeft:'auto' }}>VELOX Engine — preview mode</span>
        </div>

        {/* Canvas area */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'20px', overflow:'hidden',
        }}>
          <CableCanvas cableType={selectedCable} width={520} height={420}/>
        </div>

        {/* Bottom info */}
        <div style={{
          height:36, background:'#0f0f0f', borderTop:'1px solid #2a2a2a',
          display:'flex', alignItems:'center', padding:'0 14px', gap:20,
        }}>
          <span style={{ color:'#4caf50', fontSize:11, fontWeight:700 }}>
            {selected ? (lang === 'tr' ? selected.nameTr : selected.nameEn) : ''}
          </span>
          <span style={{ color:'#555', fontSize:10 }}>{selected?.standard}</span>
          <span style={{ color:'#444', fontSize:10, marginLeft:'auto' }}>
            Measuring field: M
          </span>
        </div>
      </div>

      {/* ── Sağ: Kablo Tipi Seçim + Kontroller (BEYAZ PANEL) ── */}
      <div style={{
        width:420, background:'#fff', borderLeft:'1px solid #d0d7d0',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* Başlık */}
        <div style={{
          padding:'10px 16px', background:'#4caf50',
          color:'#fff', fontWeight:700, fontSize:14, letterSpacing:.3,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span>{t.cableType}</span>
          <span style={{ fontSize:11, opacity:.85 }}>EK_2 — 8 Tip</span>
        </div>

        {/* Kablo tipi grid — 2 sütun, ikonlu */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:8, padding:12, overflowY:'auto', flex:1,
          background:'#f8faf8',
        }}>
          {CABLE_PROFILES.map(p => {
            const active = selectedCable === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedCable(p.id as CableTypeCategory)}
                style={{
                  background: active ? '#e8f5e9' : '#fff',
                  border: `2px solid ${active ? '#4caf50' : '#d0d7d0'}`,
                  borderRadius: 8,
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  boxShadow: active ? '0 0 0 1px #4caf50' : 'none',
                }}
              >
                <CableIcon type={p.id as CableTypeCategory}/>
                <div style={{ textAlign:'center', lineHeight:1.3 }}>
                  <div style={{
                    fontSize:11, fontWeight:700,
                    color: active ? '#2e7d32' : '#1a2a1a',
                  }}>
                    {lang === 'tr' ? p.nameTr : p.nameEn}
                  </div>
                  <div style={{ fontSize:9, color:'#778877', marginTop:2 }}>{p.standard}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Ayırıcı */}
        <div style={{ height:1, background:'#d0d7d0' }}/>

        {/* Form alanları */}
        <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10, background:'#fff' }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#445544', marginBottom:5 }}>
              {t.orderNumber}
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              style={{
                width:'100%', padding:'8px 10px',
                border:'1px solid #d0d7d0', borderRadius:5,
                fontSize:13, color:'#1a2a1a', background:'#fafafa',
              }}
            />
          </div>

          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#445544', marginBottom:5 }}>
              {t.notes}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{
                width:'100%', padding:'8px 10px',
                border:'1px solid #d0d7d0', borderRadius:5,
                fontSize:12, color:'#1a2a1a', background:'#fafafa', resize:'none',
              }}
            />
          </div>

          <button
            onClick={handleStart}
            style={{
              padding:'13px',
              background:'linear-gradient(90deg,#4caf50,#388e3c)',
              border:'none', borderRadius:7,
              color:'#fff', fontWeight:800, fontSize:15,
              letterSpacing:.5, boxShadow:'0 2px 8px rgba(76,175,80,.3)',
            }}
          >
            ▶ {t.startMeasurement}
          </button>
        </div>
      </div>
    </div>
  );
};
