import React, { useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CABLE_PROFILES } from '../../core/data/profiles';

/**
 * Builds and prints an HTML report as PDF.
 * Uses browser's built-in print dialog (landscape, A4) — includes camera image with measurement lines.
 */
function printReport(result: import('../../core/interfaces/cable').IMeasurementResult, lang: 'tr' | 'en') {
  const profile = CABLE_PROFILES.find(p => p.id === result.cableType);
  const name = profile ? (lang === 'tr' ? profile.nameTr : profile.nameEn) : result.cableType;
  const t = translations[lang];

  const rows = result.parameters.map(p => `
    <tr style="background:${p.passed ? '#f2f9f2' : '#fff4f4'}">
      <td>${lang === 'tr' ? p.nameTr : p.nameEn}</td>
      <td style="text-align:center;font-weight:700;color:${p.passed ? '#2e7d32' : '#c62828'}">${p.value}</td>
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
  <title>${t.reportTitle} - ${result.id}</title>
  <style>
    body { font-family: Segoe UI, Arial, sans-serif; font-size: 12px; padding: 24px; color: #1a2a1a; }
    h1   { font-size: 18px; color: #2e7d32; margin-bottom: 6px; }
    .meta { display:flex; gap:24px; flex-wrap:wrap; margin-bottom: 16px; border-bottom: 2px solid #3d8b40; padding-bottom: 10px; font-size: 11px; }
    .meta span { font-weight: 700; color: #1a2a1a; }
    .image-box { display: flex; gap: 20px; align-items: flex-start; margin: 16px 0; }
    .image-box img { max-width: 380px; max-height: 280px; border: 2px solid #3d8b40; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th { background: #3d8b40; color: #fff; padding: 7px 10px; text-align: left; font-size: 11px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e0e5e0; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
    .status-box { display:inline-block; padding:8px 18px; border-radius:6px; font-weight:800; font-size:14px;
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

  <div class="image-box">
    ${result.imagePath ? `<img src="${result.imagePath}" alt="Optik Ölçüm Kesiti" />` : ''}
    <div>
      <div class="status-box">${result.overallPassed ? '✓ ' + t.pass : '✗ ' + t.fail} — ${t.overallStatus}</div>
      <div style="margin-top: 14px; font-size: 11px; color: #555; line-height: 1.6;">
        <strong>Ölçüm Yöntemi:</strong> Optik Kamera & Lazer Taraması<br/>
        <strong>Standart Uyum:</strong> TS EN 60811-201 / EK_2<br/>
        <strong>Operatör:</strong> ${result.operatorName}
      </div>
    </div>
  </div>

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
  ${result.notes ? `<p style="margin-top:14px;font-size:11px;color:#555"><strong>Ölçüm Notları:</strong> ${result.notes}</p>` : ''}
  <div class="footer">Kablo Yalıtım Kalınlığı Optik Ölçüm Sistemi — Otomatik Rapor</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=950,height=750');
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

      {/* ── Sol: Görsel Paneli ── */}
      <div style={{ width: 460, display: 'flex', flexDirection: 'column', background: '#0a0a0a', flexShrink: 0 }}>
        <div style={{ height: 28, background: '#070707', display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid #222' }}>
          <span style={{ color: '#3d8b40', fontWeight: 700, fontSize: 12 }}>{t.resultsTitle}</span>
          <span style={{ color: '#666', fontSize: 10, marginLeft: 'auto' }}>{currentResult.id}</span>
        </div>

        {/* Kamera fotoğrafı + Çizilmiş ölçüm çizgileri */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }} ref={canvasRef}>
          {currentResult.imagePath ? (
            <img
              src={currentResult.imagePath}
              alt="kablo optik ölçüm kesiti"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6, border: '1px solid #333' }}
            />
          ) : (
            <CableCanvas cableType={currentResult.cableType} width={420} height={350} />
          )}
        </div>

        {/* Genel Durum Etiketi */}
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
            <div style={{ color: '#aaa', fontSize: 11, fontWeight: 600 }}>{profile ? (lang === 'tr' ? profile.nameTr : profile.nameEn) : ''}</div>
            <div style={{ color: '#666', fontSize: 10 }}>{profile?.standard}</div>
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#070707', borderTop: '1px solid #222' }}>
          <button onClick={() => setActiveScreen('measurement')} style={{
            flex: 1, padding: '9px', background: '#1a1a1a', border: '1px solid #333',
            color: '#ccc', fontWeight: 600, fontSize: 12, borderRadius: 5, cursor: 'pointer',
          }}>🔄 {t.newMeasurement}</button>
          <button onClick={() => printReport(currentResult, lang)} style={{
            flex: 1, padding: '9px', background: '#3d8b40', border: 'none',
            color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 5, cursor: 'pointer',
          }}>📄 {t.generateReport}</button>
        </div>
      </div>

      {/* ── Sağ: Ölçüm Değerleri Tablosu ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

        {/* Tablo Başlığı */}
        <div style={{
          background: '#3d8b40', color: '#fff', padding: '8px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 90px 50px 75px 75px 60px',
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
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px 50px 75px 75px 60px',
                gap: 8,
                padding: '8px 16px',
                borderBottom: `1px solid ${p.passed ? '#e8ebe8' : '#ffcdd2'}`,
                alignItems: 'center',
                fontSize: 12,
                background: idx % 2 === 0 ? '#ffffff' : (p.passed ? '#f8faf8' : '#fff9f9'),
              }}
            >
              <span style={{ color: '#1a2a1a', fontWeight: 600 }}>{lang === 'tr' ? p.nameTr : p.nameEn}</span>
              <span style={{
                fontWeight: 700, textAlign: 'center',
                color: p.passed ? '#2e7d32' : '#c62828',
              }}>{p.value}</span>
              <span style={{ textAlign: 'center', color: '#7a8a7a' }}>{p.unit}</span>
              <span style={{ textAlign: 'center', color: '#888', fontSize: 11 }}>
                {p.minTolerance !== undefined ? p.minTolerance : '—'}
              </span>
              <span style={{ textAlign: 'center', color: '#888', fontSize: 11 }}>
                {p.maxTolerance !== undefined ? p.maxTolerance : '—'}
              </span>
              <span style={{
                textAlign: 'center', fontWeight: 800, fontSize: 13,
                color: p.passed ? '#2e7d32' : '#c62828',
              }}>{p.passed ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div style={{
          padding: '8px 16px', background: '#f0f2f0', borderTop: '1px solid #d0d8d0',
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
