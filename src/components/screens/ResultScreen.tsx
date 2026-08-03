import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';
import { CableCanvas } from '../cable/CableCanvas';

export const ResultScreen: React.FC = () => {
  const { currentResult, lang, setActiveScreen } = useAppStore();
  const t = translations[lang];

  if (!currentResult) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '460px 1fr',
      gap: '20px',
      padding: '20px',
      height: 'calc(100vh - 100px)',
      boxSizing: 'border-box'
    }}>
      {/* Visual Overlay */}
      <div style={{
        backgroundColor: '#111118',
        border: '1px solid #2a2a38',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#f1f5f9' }}>
          {currentResult.cableName}
        </h4>
        <CableCanvas cableType={currentResult.cableType} />

        <div style={{
          marginTop: '20px',
          padding: '12px 20px',
          borderRadius: '8px',
          backgroundColor: currentResult.overallPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${currentResult.overallPassed ? '#22c55e' : '#ef4444'}`,
          color: currentResult.overallPassed ? '#4ade80' : '#ef4444',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {t.overallStatus}: {currentResult.overallPassed ? t.pass : t.fail}
        </div>
      </div>

      {/* Numerical Results Table */}
      <div style={{
        backgroundColor: '#111118',
        border: '1px solid #2a2a38',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, color: '#f1f5f9' }}>{t.resultsTitle}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveScreen('measurement')}
              style={{
                backgroundColor: '#1a1a24',
                border: '1px solid #2a2a38',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 {t.newMeasurement}
            </button>
            <button
              onClick={handlePrintPDF}
              style={{
                backgroundColor: '#4ade80',
                border: 'none',
                color: '#0a0a0f',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📄 {t.generateReport}
            </button>
          </div>
        </div>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          color: '#f1f5f9',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #2a2a38', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>{t.parameter}</th>
              <th style={{ padding: '12px' }}>{t.value}</th>
              <th style={{ padding: '12px' }}>{t.unit}</th>
              <th style={{ padding: '12px' }}>{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {currentResult.parameters.map((p, idx) => (
              <tr key={idx} style={{
                borderBottom: '1px solid #1a1a24',
                backgroundColor: p.passed ? 'transparent' : 'rgba(239, 68, 68, 0.1)'
              }}>
                <td style={{ padding: '12px' }}>
                  {lang === 'tr' ? p.nameTr : p.nameEn}
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>
                  {p.value}
                </td>
                <td style={{ padding: '12px', color: '#64748b' }}>
                  {p.unit}
                </td>
                <td style={{
                  padding: '12px',
                  color: p.passed ? '#4ade80' : '#ef4444',
                  fontWeight: 'bold'
                }}>
                  {p.passed ? t.pass : t.fail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
