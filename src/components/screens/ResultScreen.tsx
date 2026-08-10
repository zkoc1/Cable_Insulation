import React, { useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CABLE_PROFILES } from '../../core/data/profiles';

/**
 * Builds and prints an HTML report as PDF.
 * Uses browser's built-in print dialog (landscape, A4) — no external library needed.
 */
function printReport(result: import('../../core/interfaces/cable').IMeasurementResult, lang: 'tr' | 'en') {
  const profile = CABLE_PROFILES.find(p => p.id === result.cableType);
  const name = profile ? (lang === 'tr' ? profile.nameTr : profile.nameEn) : result.cableType;
  const t = translations[lang];

  const rows = result.parameters.map(p => `
    <tr style="background:${p.passed ? '#f2f9f2' : '#fff4f4'}">
      <td>${lang === 'tr' ? p.nameTr : p.nameEn}</td>
      <td style="text-align:center;font-weight:700">${p.value}</td>
      <td style="text-align:center">${p.unit}</td>
      <td style="text-align:center">${p.minTolerance ?? '—'}</td>
      <td style="text-align:center">${p.maxTolerance ?? '—'}</td>
      <td style="text-align:center;font-weight:800;color:${p.passed ? '#2e7d32' : '#c62828'}">
        ${p.passed ? '✓ ' + t.pass : '✗ ' + t.fail}
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${t.reportTitle}</title>
  <style>
    body { font-family: Segoe UI, Arial, sans-serif; font-size: 12px; padding: 24px; color: #1a2a1a; }
    h1   { font-size: 17px; color: #2e7d32; margin-bottom: 4px; }
    .meta { display:flex; gap:32px; margin-bottom: 18px; border-bottom: 2px solid #3d8b40; padding-bottom: 10px; }
    .meta div { }
    .meta span { font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #3d8b40; color: #fff; padding: 7px 10px; text-align: left; font-size: 11px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e0e5e0; }
    .footer { margin-top: 24px; font-size: 10px; color: #999; text-align: center; }
    .status-box { display:inline-block; padding:6px 16px; border-radius:6px; font-weight:800; font-size:15px;
      background:${result.overallPassed ? '#e8f5e9':'#fff4f4'};
      color:${result.overallPassed ? '#2e7d32':'#c62828'};
      border:2px solid ${result.overallPassed ? '#3d8b40':'#c62828'}; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <h1>${t.reportTitle}</h1>
  <div class="meta">
    <div>${t.reportDate}: <span>${result.timestamp}</span></div>
    <div>${t.reportOperator}: <span>${result.operatorName}</span></div>
    <div>${t.reportLot}: <span>${result.orderNumber}</span></div>
    <div>Kablo Tipi: <span>${name}</span></div>
    <div>Standart: <span>${result.standard}</span></div>
    <div>Ölçüm ID: <span>${result.id}</span></div>
  </div>
  <div class="status-box">${result.overallPassed ? '✓ ' + t.pass : '✗ ' + t.fail} — ${t.overallStatus}</div>
  <table>
    <thead>
      <tr>
        <th>${t.parameter}</th>
        <th style="text-align:center">${t.value}</th>
        <th style="text-align:center">${t.unit}</th>
        <th style="text-align:center">Alt Tolerans</th>
        <th style="text-align:center">Üst Tolerans</th>
        <th style="text-align:center">${t.status}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  ${result.notes ? `<p style="margin-top:16px;font-size:11px;color:#555"><strong>Not:</strong> ${result.notes}</p>` : ''}
  <div class="footer">Kablo Yalıtım Kalınlığı Ölçüm Programı — otomatik oluşturuldu</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

export const ResultScreen: React.FC = () => {
  const { currentResult, lang, setActiveScreen } = useAppStore();
  const t = translations[lang];
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!currentResult) return null;

  const profile = CABLE_PROFILES.find(p => p.id === currentResult.cableType);
  const passed = currentResult.overallPassed;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 54px)', background: '#eef0ee' }}>

      {/* ── Sol: Görsel ── */}
      <div style={{ width: 440, display: 'flex', flexDirection: 'column', background: '#111', flexShrink: 0 }}>
        <div style={{ height: 28, background: '#0a0a0a', display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid #222' }}>
          <span style={{ color: '#3d8b40', fontWeight: 700, fontSize: 12 }}>{t.resultsTitle}</span>
          <span style={{ color: '#444', fontSize: 10, marginLeft: 'auto' }}>{currentResult.id}</span>
        </div>

        {/* kamera fotoğrafı varsa göster, yoksa çizim */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }} ref={canvasRef}>
          {currentResult.imagePath ? (
            <img
              src={currentResult.imagePath}
              alt="kablo kesiti"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6 }}
            />
          ) : (
            <CableCanvas cableType={currentResult.cableType} width={400} height={340} />
          )}
        </div>

        {/* Genel durum */}
        <div style={{
          padding: '10px 14px',
          background: passed ? '#1b3a1b' : '#3a1b1b',
          borderTop: `2px solid ${passed ? '#3d8b40' : '#c62828'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: passed ? '#81c784' : '#ef9a9a' }}>{t.overallStatus}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: passed ? '#4caf50' : '#f44336' }}>
              {passed ? '✓ ' + t.pass : '✗ ' + t.fail}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#666', fontSize: 10 }}>{profile ? (lang === 'tr' ? profile.nameTr : profile.nameEn) : ''}</div>
            <div style={{ color: '#444', fontSize: 9 }}>{profile?.standard}</div>
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#0a0a0a', borderTop: '1px solid #222' }}>
          <button onClick={() => setActiveScreen('measurement')} style={{
            flex: 1, padding: '9px', background: '#1a1a1a', border: '1px solid #333',
            color: '#ccc', fontWeight: 600, fontSize: 12, borderRadius: 5,
          }}>🔄 {t.newMeasurement}</button>
          <button onClick={() => printReport(currentResult, lang)} style={{
            flex: 1, padding: '9px', background: '#3d8b40', border: 'none',
            color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 5,
          }}>📄 {t.generateReport}</button>
        </div>
      </div>

      {/* ── Sağ: Sonuç Tablosu ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

        {/* tablo başlığı */}
        <div style={{
          background: '#3d8b40', color: '#fff', padding: '7px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 80px 50px 70px 70px 60px',
          gap: 8, fontSize: 11, fontWeight: 700,
        }}>
          <span>{t.parameter}</span>
          <span style={{ textAlign: 'center' }}>{t.value}</span>
          <span style={{ textAlign: 'center' }}>{t.unit}</span>
          <span style={{ textAlign: 'center' }}>Alt Tol.</span>
          <span style={{ textAlign: 'center' }}>Üst Tol.</span>
          <span style={{ textAlign: 'center' }}>{t.status}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {currentResult.parameters.map((p, idx) => (
            <div
              key={p.key}
              className={p.passed ? 'row-pass' : 'row-fail'}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 50px 70px 70px 60px',
                gap: 8,
                padding: '7px 16px',
                borderBottom: `1px solid ${p.passed ? '#e8ebe8' : '#ffcdd2'}`,
                alignItems: 'center',
                fontSize: 12,
                background: idx % 2 === 0 ? undefined : (p.passed ? '#f8faf8' : undefined),
              }}
            >
              <span style={{ color: '#1a2a1a' }}>{lang === 'tr' ? p.nameTr : p.nameEn}</span>
              <span style={{
                fontWeight: 700, textAlign: 'center',
                color: p.passed ? '#2e7d32' : '#c62828',
              }}>{p.value}</span>
              <span style={{ textAlign: 'center', color: '#7a8a7a' }}>{p.unit}</span>
              <span style={{ textAlign: 'center', color: '#999', fontSize: 11 }}>
                {p.minTolerance !== undefined ? p.minTolerance : '—'}
              </span>
              <span style={{ textAlign: 'center', color: '#999', fontSize: 11 }}>
                {p.maxTolerance !== undefined ? p.maxTolerance : '—'}
              </span>
              <span style={{
                textAlign: 'center', fontWeight: 800, fontSize: 13,
                color: p.passed ? '#2e7d32' : '#c62828',
              }}>{p.passed ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{
          padding: '7px 16px', background: '#f0f2f0', borderTop: '1px solid #d0d8d0',
          display: 'flex', gap: 20, fontSize: 11, color: '#4a5a4a',
        }}>
          <span>{t.reportOperator}: <strong>{currentResult.operatorName}</strong></span>
          <span>{t.reportDate}: <strong>{currentResult.timestamp}</strong></span>
          <span>{t.reportLot}: <strong>{currentResult.orderNumber}</strong></span>
        </div>
      </div>
    </div>
  );
};
