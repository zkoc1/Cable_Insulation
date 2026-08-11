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
    notes, setNotes,
    measurementCount, setMeasurementCount,
    setActiveScreen, setCurrentResult,
  } = useAppStore();
  const t = translations[lang];

  const videoRef = useRef<HTMLVideoElement>(null);
  const snapCanvas = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camState, setCamState] = useState<CamState>('off');
  const [camError, setCamError] = useState('');
  const [snapshotData, setSnapshotData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const selected = CABLE_PROFILES.find(p => p.id === selectedCable);
  const now = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

  // Start live WebRTC camera stream
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
    } catch {
      setCamError(t.cameraError);
    }
  }, [t.cameraError]);

  // Stop WebRTC camera stream
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(tr => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState('off');
    setIsScanning(false);
  }, []);

  // Trigger optical light scan beam animation & capture snapshot
  const performOpticalScan = useCallback(async (targetCableType: CableTypeCategory) => {
    setIsScanning(true);
    let rawData: string | null = snapshotData;

    // If live camera is active, grab current video frame
    if (videoRef.current && snapCanvas.current && camState === 'live') {
      const vid = videoRef.current;
      const cnv = snapCanvas.current;
      cnv.width = vid.videoWidth || 640;
      cnv.height = vid.videoHeight || 480;
      cnv.getContext('2d')?.drawImage(vid, 0, 0);
      rawData = cnv.toDataURL('image/jpeg', 0.9);
    }

    // Composite optical laser measurement lines and colorized layers onto the snapshot image
    const { imagePath, measurementData } = await MeasurementOverlayService.createCompositedSnapshot(
      rawData,
      targetCableType,
      640,
      480
    );

    setSnapshotData(imagePath);
    setCamState('snapshot');

    setTimeout(() => {
      setIsScanning(false);
    }, 900);

    return { imagePath, measurementData };
  }, [camState, snapshotData]);

  // Handle cable selection change
  const handleSelectCable = (type: CableTypeCategory) => {
    setSelectedCable(type);
    if (camState === 'live') {
      performOpticalScan(type);
    }
  };

  // Run measurement and proceed to results
  const runMeasurement = async () => {
    let scanRes = { imagePath: snapshotData || '', measurementData: undefined as any };
    if (camState === 'live' || !snapshotData) {
      scanRes = await performOpticalScan(selectedCable);
    }

    const result = MeasurementCalculationService.calculate(
      selectedCable,
      session.username,
      orderNumber,
      notes,
      scanRes.imagePath || undefined,
      scanRes.measurementData
    );

    setCurrentResult(result);
    stopCamera();
    setActiveScreen('result');
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 54px)', background: '#eef0ee' }}>

      {/* ── Sol: Kamera / Optik Ölçüm Ekranı ── */}
      <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', background: '#0a0a0a', minWidth: 0, position: 'relative' }}>

        {/* Durum çubuğu */}
        <div style={{
          height: 28, background: '#070707', display: 'flex',
          alignItems: 'center', padding: '0 12px', gap: 8, borderBottom: '1px solid #222',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isScanning ? '#29b6f6' : camState === 'live' ? '#4caf50' : camState === 'snapshot' ? '#facc15' : '#555',
            display: 'inline-block',
            boxShadow: isScanning ? '0 0 8px #29b6f6' : 'none',
          }} />
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 600 }}>
            {isScanning ? '⚡ Lazer Işık Taraması Yapılıyor...' : camState === 'live' ? t.camActive : camState === 'snapshot' ? 'Optik Ölçüm Alındı' : t.camInactive}
          </span>
          {camError && <span style={{ color: '#f55', fontSize: 11, marginLeft: 8 }}>⚠ {camError}</span>}
        </div>

        {/* Görüntü alanı */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#0f0f0f' }}>
          {/* Canlı Video */}
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

          {/* Snapshot veya Optik Ölçüm Görüntüsü */}
          {camState === 'snapshot' && snapshotData && (
            <img
              src={snapshotData}
              alt="optik ölçüm kesiti"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid #333' }}
            />
          )}

          {/* Kamera Kapalıysa EK_2 Kesit Diyagramı */}
          {camState === 'off' && (
            <CableCanvas cableType={selectedCable} width={520} height={400} />
          )}

          {/* Light / Laser Scanning Beam Animation Overlay */}
          {isScanning && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(to bottom, rgba(41, 182, 246, 0) 0%, rgba(67, 160, 71, 0.4) 50%, rgba(41, 182, 246, 0) 100%)',
              animation: 'laserScan 0.9s ease-in-out infinite',
              borderTop: '2px solid #29b6f6',
              boxShadow: '0 0 15px #29b6f6',
            }} />
          )}
        </div>

        {/* Kamera ve Optik Kontrol Butonları */}
        <div style={{
          padding: '10px 14px', background: '#070707', borderTop: '1px solid #222',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {/* Optik Fotoğraf / Ölçüm Al */}
          <button
            onClick={() => performOpticalScan(selectedCable)}
            disabled={camState === 'off'}
            title={t.capture}
            style={{
              width: 46, height: 46, borderRadius: 6,
              background: camState !== 'off' ? '#1e2e1e' : '#1a1a1a',
              border: `1px solid ${camState !== 'off' ? '#3d8b40' : '#333'}`,
              color: '#ccc', fontSize: 20, cursor: camState !== 'off' ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >📷</button>

          {/* Başlat / Durdur (▶ / ⏹) */}
          <button
            onClick={camState === 'off' ? startCamera : stopCamera}
            title={camState === 'off' ? 'Kamerayı Başlat' : 'Kamerayı Durdur'}
            style={{
              width: 46, height: 46, borderRadius: 6,
              background: camState === 'live' ? '#2a1a1a' : '#1b3a1b',
              border: `1px solid ${camState === 'live' ? '#ef5350' : '#3d8b40'}`,
              color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{camState === 'live' ? '⏹' : '▶'}</button>

          {/* Yeniden Canlı Kameraya Dön */}
          {camState === 'snapshot' && (
            <button
              onClick={() => { setSnapshotData(null); setCamState('live'); }}
              title="Canlı Kameraya Dön"
              style={{
                width: 46, height: 46, borderRadius: 6,
                background: '#1a2a1a', border: '1px solid #43a047', color: '#81c784', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >🔄</button>
          )}

          <div style={{ marginLeft: 'auto', color: '#666', fontSize: 11 }}>{now}</div>
        </div>
      </div>

      {/* ── Sağ: Kablo Seçim Paneli ── */}
      <div style={{
        width: 380, background: '#fff',
        borderLeft: '1px solid #c8d0c8',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Ölçüm Sayısı */}
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid #e0e5e0',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5a4a', whiteSpace: 'nowrap' }}>
            {t.measurementCount}
          </label>
          <select
            value={measurementCount}
            onChange={e => setMeasurementCount(Number(e.target.value))}
            style={{
              padding: '5px 8px', border: '1px solid #c8d0c8',
              borderRadius: 4, fontSize: 12, color: '#1a2a1a',
            }}
          >
            {[1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Kablo Çeşitleri Grid */}
        <div style={{
          margin: '10px 12px 0', border: '1px solid #c8d0c8',
          borderRadius: 6, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '6px 10px', background: '#f0f2f0',
            borderBottom: '1px solid #c8d0c8', fontSize: 12, fontWeight: 700, color: '#4a5a4a',
          }}>
            {t.cableVarieties}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6, padding: 8, overflowY: 'auto', flex: 1, background: '#fafafa',
          }}>
            {CABLE_PROFILES.map(p => {
              const active = selectedCable === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectCable(p.id as CableTypeCategory)}
                  title={lang === 'tr' ? p.nameTr : p.nameEn}
                  style={{
                    background: active ? '#e8f5e9' : '#fff',
                    border: `2px solid ${active ? '#3d8b40' : '#d0d8d0'}`,
                    borderRadius: 6, padding: '6px 3px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 3, cursor: 'pointer',
                  }}
                >
                  <CableIcon type={p.id as CableTypeCategory} />
                  <span style={{
                    fontSize: 7, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                    color: active ? '#2e7d32' : '#7a8a7a',
                  }}>
                    {p.id.replace(/_/g, ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seçili Kablo Detayı */}
        <div style={{ padding: '7px 14px', borderTop: '1px solid #e0e5e0', background: '#f8faf8' }}>
          <strong style={{ color: '#2e7d32', fontSize: 11 }}>
            {selected ? (lang === 'tr' ? selected.nameTr : selected.nameEn) : ''}
          </strong>
          <span style={{ color: '#7a8a7a', fontSize: 10, marginLeft: 6 }}>{selected?.standard}</span>
        </div>

        {/* İş Emri ve Ölçüm Başlat Butonu */}
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #e0e5e0' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5a4a', marginBottom: 4 }}>
              {t.orderNumber}
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8d0c8', borderRadius: 4, fontSize: 12 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5a4a', marginBottom: 4 }}>
              {t.notes}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8d0c8', borderRadius: 4, fontSize: 12, resize: 'none' }}
            />
          </div>

          <button
            onClick={runMeasurement}
            style={{
              padding: '11px', background: '#3d8b40', border: 'none', borderRadius: 6,
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            ▶ {t.startMeasurement}
          </button>
        </div>
      </div>

      {/* Laser Keyframe Animation CSS */}
      <style>{`
        @keyframes laserScan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
};
