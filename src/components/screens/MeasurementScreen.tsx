import React, { useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CableIcon } from '../cable/CableIcon';
import { MeasurementCalculationService } from '../../services/MeasurementCalculationService';
import { MeasurementOverlayService } from '../../services/MeasurementOverlayService';
import type { CableTypeCategory } from '../../core/interfaces/cable';

type CamState = 'off' | 'live' | 'snapshot';

export const MeasurementScreen: React.FC = () => {
  const {
    session, lang,
    selectedCable, setSelectedCable,
    orderNumber, setOrderNumber,
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
  const [processedResult, setProcessedResult] = useState<import('../../core/interfaces/cable').IMeasurementResult | null>(null);

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
  }, []);

  // Trigger VELOX Image Processing Workflow (Images 3, 4, 5)
  const runImageProcessing = useCallback(async (targetCableType: CableTypeCategory) => {
    setIsProcessing(true);
    setProcessedResult(null);

    // Composite VELOX colorized section with radial measurement lines (Image 5)
    const { imagePath, measurementData } = await MeasurementOverlayService.createCompositedSnapshot(
      null,
      targetCableType,
      640,
      480
    );

    // Simulate processing delay (Image 4: PROCESSING..)
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
    }, 1100);
  }, [orderNumber, notes, session.username]);

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

      {/* ── Sol: Cable Cross-Section Viewport (Images 3, 4, 5 Left Panel) ── */}
      <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', background: '#ffffff', minWidth: 0, borderRight: '2px solid #ccc', position: 'relative' }}>

        {/* Viewport header */}
        <div style={{
          height: 32, background: '#f0f2f0', display: 'flex',
          alignItems: 'center', padding: '0 14px', gap: 10, borderBottom: '1px solid #ddd',
        }}>
          <span style={{
            width: 9, height: 9, borderRadius: '50%',
            background: isProcessing ? '#00e676' : camState === 'live' ? '#2e7d32' : camState === 'snapshot' ? '#f59e0b' : '#888',
            display: 'inline-block',
          }} />
          <span style={{ color: '#333', fontSize: 11, fontWeight: 700 }}>
            {isProcessing ? 'STATE-OF-THE-ART IMAGE PROCESSING ALGORITHMS' : 'Measuring field M'}
          </span>
          {camError && <span style={{ color: '#f55', fontSize: 11, marginLeft: 8 }}>⚠ {camError}</span>}
        </div>

        {/* Cable Image Center Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#ffffff', padding: 20 }}>
          {/* Canlı Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              display: camState === 'live' ? 'block' : 'none',
              width: '100%', height: '100%', objectFit: 'contain',
            }}
          />
          <canvas ref={snapCanvas} style={{ display: 'none' }} />

          {/* Colorized Processed Image with Radial Lines (Image 5 Left) */}
          {camState === 'snapshot' && snapshotData && (
            <img
              src={snapshotData}
              alt="processed cable section"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid #ccc', borderRadius: 4 }}
            />
          )}

          {/* Standby Viewport Image (Image 3 Left) */}
          {camState === 'off' && !snapshotData && (
            <CableCanvas cableType={selectedCable} width={520} height={420} />
          )}
        </div>

        {/* Bottom Control Bar (Image 3, 4, 5 Bottom Left) */}
        <div style={{
          padding: '8px 16px', background: '#f0f2f0', borderTop: '1px solid #ddd',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {/* Play / Process Button (Image 3, 4, 5) */}
          <button
            onClick={() => runImageProcessing(selectedCable)}
            disabled={isProcessing}
            title="Run Image Processing"
            style={{
              width: 44, height: 44, borderRadius: 4,
              background: isProcessing ? '#81c784' : '#4cae4f',
              border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >▶</button>

          {/* Camera Button */}
          <button
            onClick={camState === 'off' ? startCamera : stopCamera}
            title={camState === 'off' ? 'Kamerayı Aç' : 'Kamerayı Kapat'}
            style={{
              width: 44, height: 44, borderRadius: 4,
              background: camState === 'live' ? '#ef5350' : '#e0e0e0',
              border: '1px solid #bbb', color: '#333', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >📷</button>

          <div style={{ fontSize: 11, color: '#555', fontWeight: 600, marginLeft: 10 }}>
            {selected ? (lang === 'tr' ? selected.nameTr : selected.nameEn) : ''} ({selected?.standard})
          </div>
        </div>
      </div>

      {/* ── Sağ: VELOX Parameter / Results Panel (Images 3, 4, 5 Right Panel) ── */}
      <div style={{ width: 440, background: '#f4f6f4', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* 1. STATE: PROCESSING ANIMATION (Image 4 Right Side) */}
        {isProcessing ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#e0e0e0', flexDirection: 'column', gap: 16,
          }}>
            <div style={{
              fontSize: 26, fontWeight: 900, color: '#40c040',
              letterSpacing: 2, fontFamily: 'monospace',
              animation: 'blink 0.8s infinite alternate',
            }}>
              PROCESSING..
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              Kenar ve katman renklendirme algoritması çalışıyor...
            </div>
          </div>
        ) : processedResult ? (

          /* 2. STATE: PROCESSED RESULTS & TEST PLAN TABLE (Image 5 Right Side) */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

            {/* Test plan header bar matching Image 5 */}
            <div style={{
              background: '#3d8b40', color: '#fff', padding: '8px 12px',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>RESULTS & TEST PLAN</span>
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 3 }}>
                PoS Name: 0 - Coat
              </span>
            </div>

            {/* Results Table matching Image 5 Right Panel */}
            <div style={{ flex: 1, overflowY: 'auto' }}>

              {/* Layer 01 - Outerlayer */}
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

              {/* Layer 03 - Isolation_M */}
              <div style={{ background: '#e0e0e0', padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#333' }}>
                ▲ Lay. N.: 03 - Isolation_M
              </div>

              {processedResult.parameters.map((p) => (
                <div
                  key={p.key}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 45px 40px',
                    padding: '6px 12px', borderBottom: '1px solid #eee', alignItems: 'center',
                    fontSize: 11, background: p.passed ? '#daf2da' : '#ffebee', // Green highlighted rows (Image 5)
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1a2a1a' }}>{p.nameEn}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: '#1b5e20' }}>{p.value}</span>
                  <span style={{ textAlign: 'center', color: '#555', fontSize: 10 }}>{p.unit}</span>
                  <span style={{ textAlign: 'center', fontWeight: 800, color: '#2e7d32' }}>✓</span>
                </div>
              ))}

              {/* Layer 05 - Innerlayer */}
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

            {/* Bottom Proceed to Report Button */}
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

          /* 3. STATE: CABLE TYPE SELECTION GRID (Image 3 Right Side) */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '8px 12px', background: '#f0f2f0', borderBottom: '1px solid #ddd', fontSize: 11, fontWeight: 700, color: '#555' }}>
              SELECT CABLE PROFILE
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8, padding: 12, overflowY: 'auto', flex: 1, background: '#f4f6f4',
            }}>
              {CABLE_PROFILES.map(p => {
                const active = selectedCable === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectCable(p.id as CableTypeCategory)}
                    style={{
                      background: active ? '#e8f5e9' : '#fff',
                      border: `2px solid ${active ? '#3d8b40' : '#ccc'}`,
                      borderRadius: 6, padding: '10px 4px',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 6, cursor: 'pointer',
                      boxShadow: active ? '0 2px 6px rgba(61,139,64,0.2)' : 'none',
                    }}
                  >
                    <CableIcon type={p.id as CableTypeCategory} />
                    <span style={{ fontSize: 9, fontWeight: 700, textAlign: 'center', color: active ? '#2e7d32' : '#444' }}>
                      {p.id.replace(/_/g, ' ')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inputs & Measurement Start */}
            <div style={{ padding: 12, background: '#f8faf8', borderTop: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: '#555' }}>{t.orderNumber}</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 11 }}
                />
              </div>

              <button
                onClick={() => runImageProcessing(selectedCable)}
                style={{
                  padding: '10px', background: '#3d8b40', border: 'none', borderRadius: 5,
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                ▶ PROCESS CABLE SECTION
              </button>
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
