import React, { useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableIcon } from '../cable/CableIcon';
import { MeasurementCalculationService } from '../../services/MeasurementCalculationService';
import { MeasurementOverlayService } from '../../services/MeasurementOverlayService';
import type { CableTypeCategory } from '../../core/interfaces/cable';

type CamState = 'off' | 'live' | 'snapshot';
type ProcessingPhase = 'idle' | 'red' | 'green' | 'blue' | 'complete';

export const MeasurementScreen: React.FC = () => {
  const {
    session, lang,
    selectedCable, setSelectedCable,
    orderNumber, setOrderNumber,
    measurementCount, setMeasurementCount,
    notes,
    setActiveScreen, setCurrentResult,
  } = useAppStore();

  const t = translations[lang];

  const videoRef = useRef<HTMLVideoElement>(null);
  const snapCanvas = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camState, setCamState] = useState<CamState>('off');
  const [camError, setCamError] = useState('');
  const [snapshotData, setSnapshotData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('idle');
  const [processedResult, setProcessedResult] = useState<import('../../core/interfaces/cable').IMeasurementResult | null>(null);
  const [currentDate] = useState<string>(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }));

  const selected = CABLE_PROFILES.find(p => p.id === selectedCable);

  // Start WebRTC camera
  const startCamera = useCallback(async () => {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCamState('live');
      setSnapshotData(null);
      setProcessedResult(null);
    } catch {
      setCamError(t.cameraError);
    }
  }, [t.cameraError]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(tr => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState('off');
    setIsProcessing(false);
    setProcessingPhase('idle');
  }, []);

  // Back Button Action
  const handleGoBack = () => {
    setSnapshotData(null);
    setProcessedResult(null);
    setIsProcessing(false);
    setProcessingPhase('idle');
    if (camState === 'live') {
      stopCamera();
    }
  };

  // Multi-Flash RGB Lighting Sequence & Image Processing (Photos 3, 4, 5 & Şekil 1)
  const runImageProcessing = useCallback(async (targetCableType: CableTypeCategory) => {
    setIsProcessing(true);
    setProcessedResult(null);
    setProcessingPhase('red');

    // Grab real camera frame if live camera stream is active
    let rawFrame: string | null = null;
    if (videoRef.current && snapCanvas.current && camState === 'live') {
      const vid = videoRef.current;
      const cnv = snapCanvas.current;
      cnv.width = vid.videoWidth || 640;
      cnv.height = vid.videoHeight || 480;
      const ctx = cnv.getContext('2d');
      if (ctx) {
        ctx.drawImage(vid, 0, 0, cnv.width, cnv.height);
        rawFrame = cnv.toDataURL('image/jpeg', 0.92);
      }
    }

    setTimeout(() => setProcessingPhase('green'), 350);
    setTimeout(() => setProcessingPhase('blue'), 700);

    const { imagePath, measurementData } = await MeasurementOverlayService.createCompositedSnapshot(
      rawFrame,
      targetCableType,
      640,
      480
    );

    setTimeout(() => {
      const result = MeasurementCalculationService.calculate(
        targetCableType,
        session.username,
        orderNumber,
        notes,
        imagePath,
        measurementData
      );

      setSnapshotData(imagePath);
      setProcessedResult(result);
      setCamState('snapshot');
      setIsProcessing(false);
      setProcessingPhase('complete');
    }, 1050);
  }, [camState, orderNumber, notes, session.username]);

  // Handle Cable Type selection
  const handleSelectCable = (type: CableTypeCategory) => {
    setSelectedCable(type);
    runImageProcessing(type);
  };

  // Complete measurement and view full report
  const handleProceedToReport = () => {
    if (processedResult) {
      setCurrentResult(processedResult);
      stopCamera();
      setActiveScreen('result');
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 54px)', background: '#eef0ee' }}>

      {/* ── Sol: Cable Cross-Section Viewport & Camera Controls (Şekil 1 Sol Panel) ── */}
      <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', background: '#ffffff', minWidth: 0, borderRight: '2px solid #ccc', position: 'relative' }}>

        {/* Viewport Header Bar + Geri (Back) Button */}
        <div style={{
          height: 36, background: '#f0f2f0', display: 'flex',
          alignItems: 'center', padding: '0 14px', gap: 12, borderBottom: '1px solid #ddd',
        }}>
          <button
            onClick={handleGoBack}
            style={{
              padding: '4px 10px', background: '#fff', border: '1px solid #bbb',
              borderRadius: 4, fontSize: 11, fontWeight: 700, color: '#3d8b40',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ← Geri
          </button>

          <span style={{
            width: 9, height: 9, borderRadius: '50%',
            background: isProcessing ? '#00e676' : camState === 'live' ? '#2e7d32' : camState === 'snapshot' ? '#f59e0b' : '#888',
            display: 'inline-block',
          }} />
          <span style={{ color: '#333', fontSize: 11, fontWeight: 700 }}>
            {isProcessing ? `RGB FLASH LIGHT SCAN (${processingPhase.toUpperCase()})` : 'Kablo Yalıtım Kalınlığı Ölçüm Programı - Measuring field M'}
          </span>
          {camError && <span style={{ color: '#f55', fontSize: 11, marginLeft: 8 }}>⚠ {camError}</span>}
        </div>

        {/* Cable Image Center Viewport */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', background: '#ffffff', padding: 20,
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              display: camState === 'live' ? 'block' : 'none',
              width: '100%', height: '100%', objectFit: 'contain',
              filter: processingPhase === 'red' ? 'sepia(1) hue-rotate(320deg) saturate(4)'
                    : processingPhase === 'green' ? 'sepia(1) hue-rotate(90deg) saturate(5)'
                    : processingPhase === 'blue' ? 'brightness(1.2) contrast(1.4)'
                    : 'none',
              transition: 'filter 0.2s ease',
            }}
          />
          <canvas ref={snapCanvas} style={{ display: 'none' }} />

          {camState === 'snapshot' && snapshotData && (
            <img
              src={snapshotData}
              alt="processed cable section"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid #ccc', borderRadius: 4 }}
            />
          )}

          {camState === 'off' && !snapshotData && (
            <div style={{
              width: '100%', height: '100%', background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#bbb', fontSize: 13, border: '1px dashed #e0e0e0', borderRadius: 4,
            }}>
              Kamera kapalı. Fotoğraf al (📷) veya profil seç.
            </div>
          )}
        </div>

        {/* 3 Camera Control Buttons Below Viewport matching Şekil 1 (📷, ▶, ⏸) */}
        <div style={{
          padding: '12px 20px', background: '#ffffff', borderTop: '1px solid #eee',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* 1. Fotoğraf Al / Kamera Butonu (📷) */}
          <button
            onClick={camState === 'off' ? startCamera : stopCamera}
            title="Fotoğraf Al / Kamera"
            style={{
              width: 70, height: 50, borderRadius: 4,
              background: '#ffffff', border: '2px solid #333',
              color: '#333', fontSize: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >📷</button>

          {/* 2. Ölçüm Yap / Başlat Butonu (▶) */}
          <button
            onClick={() => runImageProcessing(selectedCable)}
            disabled={isProcessing}
            title="Ölçüm Yap / Başlat"
            style={{
              width: 70, height: 50, borderRadius: 4,
              background: isProcessing ? '#81c784' : '#ffffff',
              border: '2px solid #333', color: '#333', fontSize: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >▶</button>

          {/* 3. Durdur / Duraklat Butonu (⏸) */}
          <button
            onClick={stopCamera}
            title="Durdur / Duraklat"
            style={{
              width: 70, height: 50, borderRadius: 4,
              background: '#ffffff', border: '2px solid #333',
              color: '#333', fontSize: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >⏸</button>

          <div style={{ fontSize: 12, color: '#444', fontWeight: 600, marginLeft: 10 }}>
            {selected ? (lang === 'tr' ? selected.nameTr : selected.nameEn) : ''} ({selected?.standard})
          </div>
        </div>
      </div>

      {/* ── Sağ: Parameter & Profile Selection Grid (Şekil 1 Sağ Panel) ── */}
      <div style={{ width: 460, background: '#f4f6f4', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* 1. STATE: PROCESSING ANIMATION */}
        {isProcessing ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#e0e0e0', flexDirection: 'column', gap: 16,
          }}>
            <div style={{
              fontSize: 26, fontWeight: 900, color: '#40c040',
              letterSpacing: 2, fontFamily: 'monospace',
              animation: 'blink 0.6s infinite alternate',
            }}>
              PROCESSING..
            </div>
            <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>
              Flash Işık & Katman Renklendirme Algoritması ({processingPhase.toUpperCase()})
            </div>
          </div>
        ) : processedResult ? (

          /* 2. STATE: PROCESSED RESULTS & TEST PLAN TABLE */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
            <div style={{
              background: '#3d8b40', color: '#fff', padding: '8px 12px',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>RESULTS & TEST PLAN (Ölçüm Sayısı: {measurementCount})</span>
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 3 }}>
                PoS Name: 0 - Coat
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ background: '#e0e0e0', padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#333' }}>
                ▲ Lay. N.: 01 - Outerlayer
              </div>
              <div style={{
                padding: '6px 12px', fontSize: 11, display: 'flex', justifyContent: 'space-between',
                borderBottom: '1px solid #eee', background: '#f8faf8',
              }}>
                <span>Cross-section real area</span>
                <span style={{ fontWeight: 700 }}>54.684 mm²</span>
              </div>

              <div style={{ background: '#e0e0e0', padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#333' }}>
                ▲ Lay. N.: 03 - Isolation_M
              </div>

              {processedResult.parameters.map((p) => (
                <div
                  key={p.key}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 45px 40px',
                    padding: '6px 12px', borderBottom: '1px solid #eee', alignItems: 'center',
                    fontSize: 11, background: p.passed ? '#daf2da' : '#ffebee',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1a2a1a' }}>{p.nameEn}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: '#1b5e20' }}>{p.value}</span>
                  <span style={{ textAlign: 'center', color: '#555', fontSize: 10 }}>{p.unit}</span>
                  <span style={{ textAlign: 'center', fontWeight: 800, color: '#2e7d32' }}>✓</span>
                </div>
              ))}

              <div style={{ background: '#e0e0e0', padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#333' }}>
                ▲ Lay. N.: 05 - Innerlayer
              </div>
              <div style={{
                padding: '6px 12px', fontSize: 11, display: 'flex', justifyContent: 'space-between',
                borderBottom: '1px solid #eee', background: '#f8faf8',
              }}>
                <span>Diameter inner (WPs)</span>
                <span style={{ fontWeight: 700 }}>7.539 mm</span>
              </div>
            </div>

            <div style={{ padding: 12, background: '#f0f2f0', borderTop: '1px solid #ddd', display: 'flex', gap: 10 }}>
              <button
                onClick={handleProceedToReport}
                style={{
                  flex: 1, padding: '10px', background: '#2e7d32', border: 'none', borderRadius: 4,
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                }}
              >
                📄 RAPOR OLUŞTUR & YAZDIR
              </button>
            </div>
          </div>
        ) : (

          /* 3. STATE: OPERATÖR BİLGİ GİRİŞ EKRANI (Şekil 1 Sağ Side) */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, background: '#ffffff' }}>

            {/* Ölçüm Sayısı Dropdown Control matching Şekil 1 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 6 }}>
                Ölçüm Sayısı
              </label>
              <select
                value={measurementCount}
                onChange={e => setMeasurementCount(Number(e.target.value))}
                style={{
                  width: 180, padding: '6px 12px', border: '1.5px solid #333',
                  borderRadius: 4, fontSize: 13, background: '#fff', fontWeight: 600,
                }}
              >
                <option value={1}>Ölçüm Sayısı: 1</option>
                <option value={2}>Ölçüm Sayısı: 2</option>
                <option value={3}>Ölçüm Sayısı: 3</option>
                <option value={4}>Ölçüm Sayısı: 4</option>
                <option value={6}>Ölçüm Sayısı: 6</option>
                <option value={8}>Ölçüm Sayısı: 8</option>
                <option value={12}>Ölçüm Sayısı: 12</option>
                <option value={16}>Ölçüm Sayısı: 16</option>
                <option value={24}>Ölçüm Sayısı: 24</option>
              </select>
            </div>

            {/* Kablo Çeşitleri Box matching Şekil 1 (All 8 cables fit in 4x2 grid) */}
            <fieldset style={{
              border: '1.5px solid #333', borderRadius: 4, padding: '8px 10px',
              display: 'flex', flexDirection: 'column', background: '#ffffff',
              height: 240, overflow: 'hidden',
            }}>
              <legend style={{ padding: '0 6px', fontSize: 13, fontWeight: 700, color: '#333' }}>
                Kablo Çeşitleri
              </legend>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: 8, flex: 1, padding: '4px 0', overflow: 'hidden',
              }}>
                {CABLE_PROFILES.map(p => {
                  const active = selectedCable === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectCable(p.id as CableTypeCategory)}
                      style={{
                        background: active ? '#e8f5e9' : '#fff',
                        border: `1.5px solid ${active ? '#3d8b40' : '#444'}`,
                        borderRadius: 4, padding: '4px 2px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer',
                        boxShadow: active ? '0 2px 6px rgba(61,139,64,0.2)' : 'none',
                        height: '100%', width: '100%',
                      }}
                    >
                      <CableIcon type={p.id as CableTypeCategory} />
                      <span style={{ fontSize: 8.5, fontWeight: 700, textAlign: 'center', color: active ? '#2e7d32' : '#333', lineHeight: 1.1 }}>
                        {p.id.replace(/_/g, ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Order Number Input */}
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>{t.orderNumber}</label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 12 }}
              />
            </div>

            {/* Date Picker Field at Bottom Right matching Şekil 1 (12 May 2025 📅) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', border: '1px solid #666',
                padding: '4px 10px', borderRadius: 3, background: '#fff', fontSize: 12, gap: 6,
              }}>
                <span>{currentDate}</span>
                <span>📅</span>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes blink {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
