import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { CableIcon } from '../cable/CableIcon';
import { MeasurementCalculationService } from '../../services/MeasurementCalculationService';
import type { CableTypeCategory } from '../../core/interfaces/cable';

/* Camera playback state for the control buttons */
type CamState = 'idle' | 'playing' | 'paused';

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

  const [camState, setCamState] = useState<CamState>('idle');

  const selected = CABLE_PROFILES.find(p => p.id === selectedCable);

  const handleCapture = () => {
    /* Capture photo and run measurement */
    const result = MeasurementCalculationService.calculate(
      selectedCable, session.username, orderNumber, notes
    );
    setCurrentResult(result);
    setActiveScreen('result');
  };

  const now = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 54px)', background: '#eef0ee' }}>

      {/* ── Sol: Kamera / Kesit Görüntüsü ── */}
      <div style={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a1a',
        minWidth: 0,
      }}>
        {/* Status şeridi */}
        <div style={{
          height: 28, background: '#111',
          display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
          borderBottom: '1px solid #2a2a2a',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: camState === 'playing' ? '#4caf50' : '#ffb300',
            display: 'inline-block',
          }}/>
          <span style={{ color: '#aaa', fontSize: 11 }}>
            {camState === 'playing' ? t.camActive : t.camInactive}
          </span>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <CableCanvas cableType={selectedCable} width={500} height={400}/>
        </div>

        {/* Kamera kontrol butonları — görüntüdeki gibi: 📷 ▶ ⏸ */}
        <div style={{
          padding: '10px 16px',
          background: '#111',
          borderTop: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Fotoğraf / Ölçüm al */}
          <button
            onClick={handleCapture}
            title="Fotoğraf Al & Ölç"
            style={{
              width: 44, height: 44, borderRadius: 6,
              background: '#1e1e1e', border: '1px solid #3a3a3a',
              color: '#ccc', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            📷
          </button>

          {/* Başlat */}
          <button
            onClick={() => setCamState('playing')}
            title="Başlat"
            style={{
              width: 44, height: 44, borderRadius: 6,
              background: camState === 'playing' ? '#1b3a1b' : '#1e1e1e',
              border: `1px solid ${camState === 'playing' ? '#3d8b40' : '#3a3a3a'}`,
              color: '#ccc', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ▶
          </button>

          {/* Duraklat */}
          <button
            onClick={() => setCamState('paused')}
            title="Duraklat"
            style={{
              width: 44, height: 44, borderRadius: 6,
              background: camState === 'paused' ? '#2a2a00' : '#1e1e1e',
              border: `1px solid ${camState === 'paused' ? '#a0a030' : '#3a3a3a'}`,
              color: '#ccc', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ⏸
          </button>

          {/* Tarih — sağda, görüntüdeki gibi */}
          <div style={{ marginLeft: 'auto', color: '#555', fontSize: 11 }}>{now}</div>
        </div>
      </div>

      {/* ── Sağ: Seçim Paneli (BEYAZ) ── */}
      <div style={{
        width: 400,
        background: '#fff',
        borderLeft: '1px solid #c8d0c8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Ölçüm Sayısı dropdown — görüntüde üstte yer alıyor */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid #e0e5e0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5a4a', whiteSpace: 'nowrap' }}>
            Ölçüm Sayısı
          </label>
          <select
            value={measurementCount}
            onChange={e => setMeasurementCount(Number(e.target.value))}
            style={{
              padding: '5px 8px',
              border: '1px solid #c8d0c8',
              borderRadius: 4,
              fontSize: 12,
              color: '#1a2a1a',
              background: '#fafafa',
            }}
          >
            {[1, 2, 3, 5, 10].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Kablo Çeşitleri — başlıklı kutu, görüntüdeki gibi */}
        <div style={{
          margin: '10px 12px 0',
          border: '1px solid #c8d0c8',
          borderRadius: 6,
          overflow: 'hidden',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '5px 10px',
            background: '#f0f2f0',
            borderBottom: '1px solid #c8d0c8',
            fontSize: 12,
            fontWeight: 700,
            color: '#4a5a4a',
          }}>
            Kablo Çeşitleri
          </div>

          {/* 4 × 2 grid — ikonlu seçim */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            padding: 10,
            overflowY: 'auto',
            flex: 1,
            background: '#fafafa',
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
                    borderRadius: 6,
                    padding: '8px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <CableIcon type={p.id as CableTypeCategory}/>
                  <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: active ? '#2e7d32' : '#7a8a7a',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}>
                    {p.id.replace(/_/g, ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seçili kablo bilgisi */}
        <div style={{
          padding: '8px 14px',
          borderTop: '1px solid #e0e5e0',
          background: '#f8faf8',
          fontSize: 11,
          color: '#4a5a4a',
        }}>
          <strong style={{ color: '#2e7d32' }}>
            {selected ? (lang === 'tr' ? selected.nameTr : selected.nameEn) : ''}
          </strong>
          <span style={{ color: '#7a8a7a', marginLeft: 6 }}>{selected?.standard}</span>
        </div>

        {/* Form alanları */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #e0e5e0' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4a5a4a', marginBottom: 4 }}>
              {t.orderNumber}
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px',
                border: '1px solid #c8d0c8', borderRadius: 4, fontSize: 12,
              }}
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
              style={{
                width: '100%', padding: '7px 10px',
                border: '1px solid #c8d0c8', borderRadius: 4, fontSize: 12, resize: 'none',
              }}
            />
          </div>

          <button
            onClick={handleCapture}
            style={{
              padding: '11px',
              background: '#3d8b40', border: 'none', borderRadius: 6,
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
