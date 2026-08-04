import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CABLE_PROFILES } from '../../core/data/profiles';

export const ResultScreen: React.FC = () => {
  const { currentResult, lang, setActiveScreen } = useAppStore();
  const t = translations[lang];
  if (!currentResult) return null;

  const profile = CABLE_PROFILES.find(p => p.id === currentResult.cableType);
  const passed = currentResult.overallPassed;

  /* Parametreleri iki gruba böl — Coat ve İzolasyon */
  const half = Math.ceil(currentResult.parameters.length / 2);
  const groups = [
    { label: '▸ Lay. N.: 00  Coat — Dış Katman', params: currentResult.parameters.slice(0, half) },
    { label: '▸ Lay. N.: 03  Isolation', params: currentResult.parameters.slice(half) },
  ];

  return (
    <div style={{ display:'flex', height:'calc(100vh - 62px)', background:'#f0f2f0' }}>

      {/* ── Sol: Görsel ── */}
      <div style={{
        width:460, display:'flex', flexDirection:'column', background:'#1a1a1a', flexShrink:0,
      }}>
        {/* Header */}
        <div style={{
          height:36, background:'#111', display:'flex', alignItems:'center',
          padding:'0 14px', borderBottom:'1px solid #2a2a2a',
        }}>
          <span style={{ color:'#4caf50', fontWeight:700, fontSize:13 }}>RESULTS</span>
          <span style={{ color:'#555', fontSize:10, marginLeft:'auto' }}>ID: {currentResult.id}</span>
        </div>

        {/* Canvas */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        }}>
          <CableCanvas cableType={currentResult.cableType} width={410} height={360}/>
        </div>

        {/* Renk şeması */}
        <div style={{ padding:'8px 14px', borderTop:'1px solid #2a2a2a', background:'#0f0f0f' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {[
              ['#4caf50','Dış Katman'],['#c62828','XLPE/İzolasyon'],
              ['#1565c0','İç Yarı İletken'],['#9e9e9e','İletken'],
              ['#f9a825','O1 Merkez'],['#ef5350','O2 Merkez'],
            ].map(([c,l]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
                <span style={{ fontSize:9, color:'#777' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Genel durum */}
        <div style={{
          padding:'10px 14px',
          background: passed ? '#1b3a1b' : '#3a1b1b',
          borderTop:`2px solid ${passed ? '#4caf50' : '#c62828'}`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <div>
            <div style={{ color: passed ? '#81c784':'#ef9a9a', fontSize:12, fontWeight:600 }}>{t.overallStatus}</div>
            <div style={{ color: passed ? '#4caf50':'#c62828', fontSize:18, fontWeight:900 }}>
              {passed ? '✓ PASS' : '✗ FAIL'}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'#555', fontSize:10 }}>{profile ? (lang==='tr' ? profile.nameTr : profile.nameEn) : ''}</div>
            <div style={{ color:'#444', fontSize:9 }}>{profile?.standard}</div>
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ display:'flex', gap:8, padding:'10px 14px', background:'#111', borderTop:'1px solid #2a2a2a' }}>
          <button onClick={() => setActiveScreen('measurement')} style={{
            flex:1, padding:'9px', background:'#2a2a2a', border:'1px solid #3a3a3a',
            color:'#ccc', fontWeight:600, fontSize:12, borderRadius:5,
          }}>🔄 {t.newMeasurement}</button>
          <button onClick={() => window.print()} style={{
            flex:1, padding:'9px',
            background:'linear-gradient(90deg,#4caf50,#388e3c)',
            border:'none', color:'#fff', fontWeight:800, fontSize:12, borderRadius:5,
          }}>📄 {t.generateReport}</button>
        </div>
      </div>

      {/* ── Sağ: Sonuç Tablosu (BEYAZ) ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff', overflow:'hidden' }}>

        {/* Tablo başlığı — VELOX stili yeşil şerit */}
        <div style={{
          background:'#4caf50', color:'#fff', padding:'6px 16px',
          display:'flex', gap:20, alignItems:'center', fontSize:11, fontWeight:700,
        }}>
          <span>Ov</span><span>ProdS.N</span><span>Feat.N</span>
          <span style={{ flex:1 }}>Parametre Adı</span>
          <span>KProv</span><span>Spec.SN</span>
          <span style={{ width:60, textAlign:'right' }}>Değer</span>
          <span style={{ width:55 }}>low.Tol</span>
          <span style={{ width:55 }}>up.Tol</span>
          <span style={{ width:40 }}>Birim</span>
          <span>Com.</span>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {/* PoS Name header */}
          <div style={{
            padding:'6px 16px', background:'#f5f7f5',
            borderBottom:'1px solid #e0e5e0', color:'#445544', fontSize:11, fontWeight:700,
          }}>
            ◆ PoS Name: 0 — Coat — No specification
          </div>

          {groups.map((group, gi) => (
            <div key={gi}>
              <div style={{
                padding:'5px 16px', background:'#ecf0ec',
                borderBottom:'1px solid #d8ddd8', color:'#2e7d32',
                fontSize:11, fontWeight:700,
              }}>
                {group.label}
              </div>

              {group.params.map((p, idx) => {
                const rowNum = gi * half + idx + 1;
                const isHighlighted = !p.passed;
                return (
                  <div
                    key={p.key}
                    className={p.passed ? 'row-pass' : 'row-fail'}
                    style={{
                      display:'flex', alignItems:'center',
                      padding:'5px 16px', gap:20,
                      borderBottom:`1px solid ${isHighlighted ? '#ffcdd2' : '#eef1ee'}`,
                      fontSize:12,
                    }}
                  >
                    <span style={{ width:20, color:'#999', fontSize:10 }}>{rowNum}</span>
                    <span style={{ width:35, color:'#999', fontSize:10 }}>Coat</span>
                    <span style={{ width:22, color:'#bbb', fontSize:10 }}>{rowNum}</span>
                    <span style={{ flex:1, color:'#1a2a1a' }}>{lang === 'tr' ? p.nameTr : p.nameEn}</span>
                    <span style={{ width:45, color:'#999', fontSize:10 }}>VCP</span>
                    <span style={{ width:45, color:'#bbb', fontSize:10 }}>---</span>
                    <span style={{
                      width:60, textAlign:'right', fontWeight:700,
                      color: p.passed ? '#2e7d32' : '#c62828',
                    }}>{p.value}</span>
                    <span style={{ width:55, color:'#999', fontSize:11 }}>
                      {p.minTolerance !== undefined ? p.minTolerance : '---'}
                    </span>
                    <span style={{ width:55, color:'#999', fontSize:11 }}>
                      {p.maxTolerance !== undefined ? p.maxTolerance : '---'}
                    </span>
                    <span style={{ width:40, color:'#667766', fontSize:11 }}>{p.unit}</span>
                    <span className={p.passed ? 'pass-badge' : 'fail-badge'} style={{ fontSize:13 }}>
                      {p.passed ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer: oturum bilgisi */}
        <div style={{
          padding:'8px 16px', background:'#f0f2f0', borderTop:'1px solid #d0d7d0',
          display:'flex', gap:24, alignItems:'center',
        }}>
          {[['Prüfer', currentResult.operatorName], ['Auftrag', currentResult.orderNumber], ['Zaman', currentResult.timestamp]].map(([k,v]) => (
            <div key={k}>
              <span style={{ fontSize:10, color:'#778877' }}>{k}: </span>
              <strong style={{ fontSize:11, color:'#445544' }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
