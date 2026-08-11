import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';

const APP_TITLE = 'Kablo Yalıtım Kalınlığı Ölçüm Programı';

export const TopBar: React.FC = () => {
  const { session, lang, setLang, logout, setActiveScreen } = useAppStore();
  const t = translations[lang];

  return (
    <div style={{
      height: 54,
      background: '#1b261b',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      borderBottom: '2px solid #3d8b40',
      flexShrink: 0,
    }}>
      {/* Sleek Industrial Logo SVG */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: '#243324',
        border: '1px solid #3d8b40',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="2.5" fill="#1b261b" />
          <circle cx="12" cy="12" r="6" fill="#3d8b40" stroke="#81c784" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Program Title */}
      <div style={{ color: '#e8f5e9', fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>
        {APP_TITLE}
      </div>

      <div style={{ width: 1, height: 26, background: '#3a4a3a', margin: '0 4px' }} />

      {/* User Session Info */}
      {session.isLoggedIn && (
        <div style={{ display: 'flex', gap: 20, flex: 1 }}>
          <div>
            <div style={{ color: '#81c784', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.operator}
            </div>
            <div style={{ color: '#e8f5e9', fontSize: 12, fontWeight: 600 }}>
              {session.username}
            </div>
          </div>
          <div>
            <div style={{ color: '#81c784', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.role}
            </div>
            <div style={{ color: '#e8f5e9', fontSize: 12, fontWeight: 600 }}>
              {session.role === 'ADMIN' ? t.admin : t.operator}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          style={{
            background: '#2e3d2e', border: '1px solid #3d8b40', color: '#81c784',
            padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
          }}
        >
          {lang.toUpperCase()}
        </button>

        {session.isLoggedIn && (
          <>
            {session.role === 'ADMIN' && (
              <button
                onClick={() => setActiveScreen('admin')}
                style={{
                  background: '#2e3d2e', border: '1px solid #3d8b40', color: '#aed6ae',
                  padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                }}
              >
                ⚙ {t.adminPanel}
              </button>
            )}
            <button
              onClick={logout}
              style={{
                background: 'transparent', border: '1px solid #5a3030', color: '#ef9a9a',
                padding: '4px 10px', borderRadius: 4, fontSize: 11,
              }}
            >
              {t.logout}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
