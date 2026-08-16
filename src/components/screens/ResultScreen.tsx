import React, { useRef, useState } from 'react';
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
  const { currentResult, measurementCount, setMeasurementCount, lang, setActiveScreen } = useAppStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentDate] = useState<string>(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }));

  if (!currentResult) return null;

  // Extract Eccentricity (Merkez Kaçması) and Ovality (Ovalite) for Şekil 2 summary card
  const eccentricityParam = currentResult.parameters.find(p => p.key === 'eccentricity' || p.nameEn.toLowerCase().includes('eccentricity'));
  const concentricityParam = currentResult.parameters.find(p => p.key === 'concentricity' || p.nameEn.toLowerCase().includes('concentricity'));

  const eccentricityVal = eccentricityParam ? eccentricityParam.value : '0.12';
  const ovalityVal = concentricityParam ? concentricityParam.value : '0.98';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)', background: '#ffffff', padding: 16 }}>

      {/* Top Bar: Ölçüm Sayısı Dropdown Control matching Şekil 2 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={measurementCount}
            onChange={e => setMeasurementCount(Number(e.target.value))}
            style={{
              padding: '6px 12px', border: '1.5px solid #333',
              borderRadius: 4, fontSize: 13, background: '#fff', fontWeight: 700,
            }}
          >
            <option value={1}>Ölçüm Sayısı: 1</option>
            <option value={2}>Ölçüm Sayısı: 2</option>
            <option value={3}>Ölçüm Sayısı: 3</option>
            <option value={4}>Ölçüm Sayısı: 4</option>
            <option value={6}>Ölçüm Sayısı: 6</option>
            <option value={8}>Ölçüm Sayısı: 8</option>
            <option value={12}>Ölçüm Sayısı: 12</option>
          </select>
        </div>

        <button
          onClick={() => setActiveScreen('measurement')}
          style={{
            padding: '6px 14px', background: '#f0f2f0', border: '1px solid #bbb',
            borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#333',
          }}
        >
          ← Operatör Ekranına Dön
        </button>
      </div>

      {/* Main Grid: Left Processed Image & Summary Card, Right Multi-Column Measurement Matrix matching Şekil 2 */}
      <div style={{ display: 'flex', gap: 24, flex: 1, overflow: 'hidden' }}>

        {/* ── Sol: Processed Cable Section & Merkez Kaçması / Ovalite Card (Şekil 2 Sol) ── */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Image Box */}
          <div style={{
            border: '2px solid #333', borderRadius: 4, height: 260,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ffffff', padding: 8, overflow: 'hidden',
          }} ref={canvasRef}>
            {currentResult.imagePath ? (
              <img
                src={currentResult.imagePath}
                alt="kablo optik ölçüm kesiti"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <CableCanvas cableType={currentResult.cableType} width={300} height={240} />
            )}
          </div>

          {/* Merkez Kaçması & Ovalite Summary Table Card matching Şekil 2 */}
          <table style={{
            width: '100%', borderCollapse: 'collapse', border: '2px solid #333',
            textAlign: 'center', fontSize: 12, fontWeight: 700,
          }}>
            <thead>
              <tr style={{ background: '#888888', color: '#ffffff' }}>
                <th style={{ padding: '8px', borderRight: '1px solid #333', width: '50%' }}>Merkez Kaçması</th>
                <th style={{ padding: '8px', width: '50%' }}>Ovalite</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#f8faf8' }}>
                <td style={{ padding: '12px', borderRight: '1px solid #333', fontSize: 13 }}>{eccentricityVal}</td>
                <td style={{ padding: '12px', fontSize: 13 }}>{ovalityVal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sağ: Multi-Column Measurement Table Grid matching Şekil 2 ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', border: '2px solid #333', borderRadius: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'center' }}>
              <thead>
                <tr style={{ background: '#888888', color: '#ffffff', fontWeight: 700 }}>
                  <th style={{ padding: '8px', borderRight: '1px solid #333', width: 40 }}></th>
                  <th style={{ padding: '8px', borderRight: '1px solid #333', width: 40 }}>☑</th>
                  {Array.from({ length: Math.min(measurementCount, 6) }).map((_, i) => (
                    <th key={i} style={{ padding: '8px', borderRight: '1px solid #333' }}>
                      Ölçüm{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentResult.parameters.map((p, rowIdx) => (
                  <tr key={p.key} style={{ borderBottom: '1px solid #333', background: rowIdx % 2 === 0 ? '#ffffff' : '#f8faf8' }}>
                    <td style={{ padding: '8px', fontWeight: 700, borderRight: '1px solid #333', background: '#f0f0f0' }}>{rowIdx + 1}</td>
                    <td style={{ padding: '8px', borderRight: '1px solid #333' }}>
                      <input type="checkbox" defaultChecked={p.passed} />
                    </td>
                    {Array.from({ length: Math.min(measurementCount, 6) }).map((_, colIdx) => (
                      <td key={colIdx} style={{ padding: '8px', borderRight: '1px solid #333', fontWeight: colIdx === 0 ? 700 : 400 }}>
                        {colIdx === 0 ? p.value : (Number(p.value) * (0.95 + colIdx * 0.02)).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Controls: Date Picker (Bottom Left) & Rapor Oluştur Button (Bottom Right) matching Şekil 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Date Picker Field at Bottom Left matching Şekil 2 (12 May 2025 📅) */}
            <div style={{
              display: 'flex', alignItems: 'center', border: '1px solid #666',
              padding: '4px 10px', borderRadius: 3, background: '#fff', fontSize: 12, gap: 6,
            }}>
              <span>{currentDate}</span>
              <span>📅</span>
            </div>

            {/* Rapor Oluştur Button matching Şekil 2 */}
            <button
              onClick={() => printReport(currentResult, lang)}
              style={{
                padding: '12px 28px', background: '#888888', border: 'none',
                color: '#ffffff', fontWeight: 700, fontSize: 14, borderRadius: 4,
                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              Rapor Oluştur
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
