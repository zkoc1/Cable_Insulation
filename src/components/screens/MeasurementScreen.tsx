import React, { useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CableIcon } from '../cable/CableIcon';
import { MeasurementCalculationService } from '../../services/MeasurementCalculationService';
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

  const selected = CABLE_PROFILES.find(p => p.id === selectedCable);
  const now = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

  // Start live camera feed via WebRTC
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

  // Stop camera stream
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(tr => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState('off');
  }, []);

  // Freeze current frame as snapshot
  const takeSnapshot = useCallback(() => {
    if (!videoRef.current || !snapCanvas.current) return;
    const vid = videoRef.current;
    const cnv = snapCanvas.current;
    cnv.width = vid.videoWidth || 640;
    cnv.height = vid.videoHeight || 480;
    cnv.getContext('2d')?.drawImage(vid, 0, 0);
    setSnapshotData(cnv.toDataURL('image/jpeg', 0.9));
    setCamState('snapshot');
    // keep stream alive so user can retake
  }, []);

  // Run measurement and go to result screen
  const runMeasurement = () => {
    const result = MeasurementCalculationService.calculate(
      selectedCable, session.username, orderNumber, notes,
      snapshotData ?? undefined
    );
    setCurrentResult(result);
    stopCamera();
    setActiveScreen('result');
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 54px)', background: '#eef0ee' }}>

      {/* ── Sol: Kamera / Kesit Görüntüsü ── */}
      <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', background: '#111', minWidth: 0 }}>

        {/* durum çubuğu */}
        <div style={{
          height: 28, background: '#0a0a0a', display: 'flex',
          alignItems: 'center', padding: '0 12px', gap: 8, borderBottom: '1px solid #222',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: camState === 'live' ? '#4caf50' : camState === 'snapshot' ? '#facc15' : '#555',
            display: 'inline-block',
          }} />
          <span style={{ color: '#aaa', fontSize: 11 }}>
            {camState === 'live' ? t.camActive : camState === 'snapshot' ? 'Fotoğraf Alındı' : t.camInactive}
          </span>
          {camError && <span style={{ color: '#f55', fontSize: 11, marginLeft: 8 }}>⚠ {camError}</span>}
        </div>

        {/* görüntü alanı */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* canlı video */}
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
          {/* gizli snapshot canvas */}
          <canvas ref={snapCanvas} style={{ display: 'none' }} />

          {/* snapshot görüntüsü */}
          {camState === 'snapshot' && snapshotData && (
            <img src={snapshotData} alt="snapshot"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )}

          {/* kamera kapalıysa test kesiti göster */}
          {camState === 'off' && (
            <CableCanvas cableType={selectedCable} width={500} height={380} />
          )}
        </div>

        {/* kamera kontrol butonları — EK_3 Şekil 1 gibi */}
        <div style={{
          padding: '10px 14px', background: '#0a0a0a', borderTop: '1px solid #222',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {/* Fotoğraf Al */}
          <button
            onClick={camState === 'live' ? takeSnapshot : runMeasurement}
            disabled={camState === 'off'}
            title={t.capture}
            style={{
              width: 46, height: 46, borderRadius: 6,
              background: camState !== 'off' ? '#1e2e1e' : '#1a1a1a',
              border: `1px solid ${camState !== 'off' ? '#3d8b40' : '#333'}`,
              color: '#ccc', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >📷</button>

          {/* Başlat / Durdur */}
          <button
            onClick={camState === 'off' ? startCamera : stopCamera}
            title={camState === 'off' ? 'Kamerayı Başlat' : 'Kamerayı Durdur'}
            style={{
              width: 46, height: 46, borderRadius: 6,
              background: camState === 'live' ? '#1b3a1b' : '#1a1a1a',
              border: `1px solid ${camState === 'live' ? '#3d8b40' : '#555'}`,
              color: '#ccc', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{camState === 'live' ? '⏹' : '▶'}</button>

          {/* Yeniden çek (snapshot modundayken) */}
          {camState === 'snapshot' && (
            <button
              onClick={() => { setSnapshotData(null); setCamState('live'); }}
              title="Yeniden Çek"
              style={{
                width: 46, height: 46, borderRadius: 6,
                background: '#2a2a00', border: '1px solid #888', color: '#ccc', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >🔄</button>
          )}

          <div style={{ marginLeft: 'auto', color: '#444', fontSize: 11 }}>{now}</div>
        </div>
      </div>

      {/* ── Sağ: Seçim Paneli ── */}
      <div style={{
        width: 400, background: '#fff',
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

        {/* Kablo Çeşitleri */}
        <div style={{
          margin: '10px 12px 0', border: '1px solid #c8d0c8',
          borderRadius: 6, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '5px 10px', background: '#f0f2f0',
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
                  onClick={() => setSelectedCable(p.id as CableTypeCategory)}
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

        {/* Seçili kablo */}
        <div style={{ padding: '7px 14px', borderTop: '1px solid #e0e5e0', background: '#f8faf8' }}>
          <strong style={{ color: '#2e7d32', fontSize: 11 }}>
            {selected ? (lang === 'tr' ? selected.nameTr : selected.nameEn) : ''}
          </strong>
          <span style={{ color: '#7a8a7a', fontSize: 10, marginLeft: 6 }}>{selected?.standard}</span>
        </div>

        {/* Form */}
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
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}
          >
            ▶ {t.startMeasurement}
          </button>
        </div>
      </div>
    </div>
  );
};
