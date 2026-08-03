import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CABLE_PROFILES } from '../../core/data/profiles';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';
import { MeasurementCalculationService } from '../../services/MeasurementCalculationService';

export const MeasurementScreen: React.FC = () => {
  const {
    session,
    lang,
    selectedCable,
    setSelectedCable,
    orderNumber,
    setOrderNumber,
    notes,
    setNotes,
    setActiveScreen,
    setCurrentResult
  } = useAppStore();

  const t = translations[lang];

  const handleStartMeasurement = () => {
    const result = MeasurementCalculationService.calculate(
      selectedCable,
      session.username,
      orderNumber,
      notes
    );
    setCurrentResult(result);
    setActiveScreen('result');
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      gap: '20px',
      padding: '20px',
      height: 'calc(100vh - 100px)',
      boxSizing: 'border-box'
    }}>
      {/* Left Column: Camera Preview / Cross Section */}
      <div style={{
        backgroundColor: '#111118',
        border: '1px solid #2a2a38',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>
            📹 {t.camInactive}
          </span>
          <span style={{ color: '#64748b', fontSize: '13px' }}>
            VELOX Engine v23.1.27
          </span>
        </div>

        <CableCanvas cableType={selectedCable} />
      </div>

      {/* Right Column: Configuration & Controls */}
      <div style={{
        backgroundColor: '#111118',
        border: '1px solid #2a2a38',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#f1f5f9', fontSize: '18px' }}>
          {t.cableType}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {CABLE_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedCable(profile.id)}
              style={{
                backgroundColor: selectedCable === profile.id ? '#1e293b' : '#1a1a24',
                border: `2px solid ${selectedCable === profile.id ? '#4ade80' : '#2a2a38'}`,
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>{profile.icon}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {lang === 'tr' ? profile.nameTr : profile.nameEn}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {profile.standard}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
            {t.orderNumber}
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#1a1a24',
              border: '1px solid #2a2a38',
              borderRadius: '6px',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
            {t.notes}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#1a1a24',
              border: '1px solid #2a2a38',
              borderRadius: '6px',
              color: '#fff',
              boxSizing: 'border-box',
              resize: 'none'
            }}
          />
        </div>

        <button
          onClick={handleStartMeasurement}
          style={{
            marginTop: 'auto',
            padding: '14px',
            backgroundColor: '#4ade80',
            border: 'none',
            borderRadius: '8px',
            color: '#0a0a0f',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ▶️ {t.startMeasurement}
        </button>
      </div>
    </div>
  );
};
