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

  /* Group parameters into layers (for VELOX-style grouped table) */
  const groups: { label: string; params: typeof currentResult.parameters }[] = [
    { label: lang === 'tr' ? '◆ Dış Katman — Coat' : '◆ Outer Layer — Coat', params: currentResult.parameters.filter((_, i) => i < 3) },
    { label: lang === 'tr' ? '◆ İzolasyon Katmanı' : '◆ Isolation Layer', params: currentResult.parameters.filter((_, i) => i >= 3) },
  ];

  return (
    <div style={{ display:'flex', height:'calc(100vh - 60px)', overflow:'hidden' }}>

      {/* ─── Left: Visual ─── */}
      <div style={{ width: 460, display:'flex', flexDirection:'column', padding:'16px', gap:'12px', borderRight:'1px solid #1e2330', background:'#0a0c0f' }}>
        <div style={{ padding:'8px 14px', background:'#111318', borderRadius:8, border:'1px solid #262d3a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <strong style={{ color:'#4ade80', fontSize:14 }}>RESULTS</strong>
          <span style={{ fontSize:11, color:'#475569' }}>ID: {currentResult.id}</span>
        </div>

        <div style={{ flex:1, background:'#0c0e12', borderRadius:10, border:'1px solid #1e2330', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          <CableCanvas cableType={currentResult.cableType} width={420} height={360}/>
        </div>

        {/* colour legend */}
        <div style={{ padding:'10px 14px', background:'#111318', borderRadius:8, border:'1px solid #262d3a' }}>
          <div style={{ fontSize:11, color:'#94a3b8', marginBottom:8, fontWeight:600 }}>Katman Renk Şeması</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {[
              { c:'#4ade80', lbl:'Dış Katman' },
              { c:'#ef4444', lbl:'XLPE / İzolasyon' },
              { c:'#3b82f6', lbl:'İç Yarı İletken' },
              { c:'#9ca3af', lbl:'İletken' },
              { c:'#facc15', lbl:'O1 (dış merkez)' },
              { c:'#ef4444', lbl:'O2 (iç merkez)' },
            ].map(({ c, lbl }) => (
              <div key={lbl} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:c }}/>
                <span style={{ fontSize:10, color:'#94a3b8' }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* overall status */}
        <div style={{
          padding:'12px 18px',
          borderRadius:10,
          border:`2px solid ${currentResult.overallPassed ? '#4ade80' : '#f43f5e'}`,
          background: currentResult.overallPassed ? 'rgba(74,222,128,0.1)' : 'rgba(244,63,94,0.1)',
          textAlign:'center',
        }}>
          <div style={{ fontSize:12, color:'#94a3b8', marginBottom:4 }}>{t.overallStatus}</div>
          <div style={{ fontSize:20, fontWeight:800, color: currentResult.overallPassed ? '#4ade80' : '#f43f5e' }}>
            {currentResult.overallPassed ? '✓ ' + t.pass : '✗ ' + t.fail}
          </div>
          <div style={{ fontSize:11, color:'#475569', marginTop:4 }}>
            {profile ? (lang === 'tr' ? profile.nameTr : profile.nameEn) : ''} — {currentResult.standard}
          </div>
        </div>

        {/* action buttons */}
        <div style={{ display:'flex', gap:'10px' }}>
          <button
            onClick={() => setActiveScreen('measurement')}
            style={{ flex:1, padding:'10px', background:'#111318', border:'1px solid #262d3a', borderRadius:8, color:'#f1f5f9', fontWeight:600, fontSize:13 }}
          >
            🔄 {t.newMeasurement}
          </button>
          <button
            onClick={() => window.print()}
            style={{ flex:1, padding:'10px', background:'#4ade80', border:'none', borderRadius:8, color:'#051007', fontWeight:800, fontSize:13 }}
          >
            📄 {t.generateReport}
          </button>
        </div>
      </div>

      {/* ─── Right: Results Table ─── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* table header bar */}
        <div style={{ padding:'8px 16px', background:'#111318', borderBottom:'1px solid #1e2330', display:'flex', gap:'24px', alignItems:'center' }}>
          {['Ov', 'ProdS.N', 'Feat.N', 'KProv', 'Spec.SN', 'Value', 'ow Tol', 'sp.Tol', 'Unit SN', 'Com'].map(h => (
            <span key={h} style={{ fontSize:10, color:'#475569', fontWeight:600 }}>{h}</span>
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'0 0 12px 0' }}>
          {groups.map((group, gi) => (
            <div key={gi}>
              {/* group header */}
              <div style={{ padding:'8px 16px', background:'#0e1015', borderBottom:'1px solid #1a1f2e', color:'#94a3b8', fontSize:12, fontWeight:700 }}>
                {group.label}
              </div>
              {group.params.map((p, idx) => (
                <div
                  key={p.key}
                  className={p.passed ? 'row-pass' : 'row-fail'}
                  style={{
                    display:'grid',
                    gridTemplateColumns:'28px 32px 32px 1fr 80px 90px 70px 70px 50px 40px',
                    alignItems:'center',
                    padding:'6px 16px',
                    borderBottom:'1px solid #12161e',
                    fontSize:12,
                  }}
                >
                  <span style={{ color:'#475569' }}>{gi * 3 + idx + 1}</span>
                  <span style={{ color:'#94a3b8', fontSize:10 }}>Coat</span>
                  <span style={{ color:'#475569', fontSize:10 }}>{gi * 3 + idx + 1}</span>
                  <span style={{ color:'#f1f5f9' }}>{lang === 'tr' ? p.nameTr : p.nameEn}</span>
                  <span style={{ color:'#475569', fontSize:10 }}>VCP</span>
                  <span style={{ color:'#475569', fontSize:10 }}>---</span>
                  <span style={{ fontWeight:700, color: p.passed ? '#4ade80' : '#f43f5e' }}>{p.value}</span>
                  <span style={{ color:'#64748b' }}>{p.minTolerance ?? '---'}</span>
                  <span style={{ color:'#94a3b8' }}>{p.unit}</span>
                  <span className={p.passed ? 'badge-pass' : 'badge-fail'} style={{ fontSize:10 }}>
                    {p.passed ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* session info footer */}
        <div style={{ padding:'8px 16px', background:'#0e1015', borderTop:'1px solid #1e2330', display:'flex', gap:'24px' }}>
          {[
            ['Operatör', currentResult.operatorName],
            ['Tarih / Saat', currentResult.timestamp],
            ['Lot No', currentResult.orderNumber],
          ].map(([k, v]) => (
            <div key={k}>
              <span style={{ fontSize:10, color:'#475569' }}>{k}: </span>
              <strong style={{ fontSize:11, color:'#94a3b8' }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
