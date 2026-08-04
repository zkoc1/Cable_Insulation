import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';

/* App title — our own product, not VisioCablePro */
const APP_NAME = 'Kablo Yalıtım Kalınlığı Ölçüm Programı';

export const TopBar: React.FC = () => {
  const { session, lang, setLang, logout, setActiveScreen } = useAppStore();
  const t = translations[lang];
  const now = new Date().toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' });

  return (
    <div style={{
      height: 54,
      background: '#243324',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 16,
      borderBottom: '2px solid #3d8b40',
      flexShrink: 0,
    }}>
      {/* App name */}
      <div style={{ color: '#e8f5e9', fontWeight: 600, fontSize: 14, letterSpacing: 0.2, marginRight: 8 }}>
        {APP_NAME}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 28, background: '#3a4a3a' }}/>

      {/* Session meta */}
      {session.isLoggedIn && (
        <div style={{ display: 'flex', gap: 20, flex: 1 }}>
          {[
            ['Prüfer', session.username],
            ['Temp.', '21°C'],
            ['Tarih', now],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ color: '#81c784', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
              <div style={{ color: '#e8f5e9', fontSize: 12, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Right controls */}
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
            <span style={{ color: '#81c784', fontSize: 11 }}>
              {session.username} ({session.role})
            </span>

            {session.role === 'ADMIN' && (
              <button
                onClick={() => setActiveScreen('admin')}
                style={{
                  background: '#2e3d2e', border: '1px solid #3d8b40', color: '#aed6ae',
                  padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                }}
              >
                ⚙ Admin
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
