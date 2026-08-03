import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';
import { CABLE_PROFILES } from '../../core/data/profiles';

export const AdminScreen: React.FC = () => {
  const { lang, setActiveScreen } = useAppStore();
  const t = translations[lang];

  return (
    <div style={{
      padding: '20px',
      height: 'calc(100vh - 100px)',
      boxSizing: 'border-box',
      backgroundColor: '#0a0a0f',
      color: '#f1f5f9',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, color: '#4ade80' }}>⚙️ {t.adminPanel}</h2>
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
          ⬅️ Back
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {CABLE_PROFILES.map((profile) => (
          <div key={profile.id} style={{
            backgroundColor: '#111118',
            border: '1px solid #2a2a38',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{profile.icon}</div>
            <h4 style={{ margin: '0 0 5px 0', color: '#f1f5f9' }}>
              {lang === 'tr' ? profile.nameTr : profile.nameEn}
            </h4>
            <div style={{ fontSize: '12px', color: '#4ade80', marginBottom: '15px' }}>
              {profile.standard}
            </div>

            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>
              {lang === 'tr' ? profile.descriptionTr : profile.descriptionEn}
            </div>

            <div style={{ borderTop: '1px solid #2a2a38', paddingTop: '10px' }}>
              <strong style={{ fontSize: '12px', color: '#64748b' }}>Active Parameters:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {profile.parameters.map((param, i) => (
                  <span key={i} style={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2a2a38',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#38bdf8'
                  }}>
                    {param}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
