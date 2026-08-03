import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';

export const TopBar: React.FC = () => {
  const { session, lang, setLang, logout, setActiveScreen } = useAppStore();
  const t = translations[lang];

  return (
    <div style={{
      height: '60px',
      backgroundColor: '#111118',
      borderBottom: '1px solid #2a2a38',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      color: '#f1f5f9'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: '#4ade80',
          color: '#0a0a0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>V</div>
        <span style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.5px' }}>{t.appTitle}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          style={{
            backgroundColor: '#1a1a24',
            border: '1px solid #2a2a38',
            color: '#4ade80',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🌐 {lang.toUpperCase()}
        </button>

        {session.isLoggedIn && (
          <>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              👤 <strong style={{ color: '#f1f5f9' }}>{session.username}</strong> ({session.role})
            </div>

            {session.role === 'ADMIN' && (
              <button
                onClick={() => setActiveScreen('admin')}
                style={{
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ⚙️ {t.adminPanel}
              </button>
            )}

            <button
              onClick={logout}
              style={{
                backgroundColor: '#ef4444',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🚪 {t.logout}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
