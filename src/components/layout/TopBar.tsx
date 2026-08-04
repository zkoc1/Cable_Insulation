import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';

export const TopBar: React.FC = () => {
  const { session, lang, setLang, logout, setActiveScreen } = useAppStore();
  const t = translations[lang];

  return (
    <div style={{
      height: 60,
      background: '#0d1117',
      borderBottom: '1px solid #1e2330',
      display: 'flex',
      alignItems: 'center',
      padding: '0 18px',
      gap: 16,
    }}>
      {/* brand */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:8 }}>
        <div style={{
          width:36, height:36, borderRadius:8,
          background:'linear-gradient(135deg,#4ade80,#16a34a)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:900, fontSize:18, color:'#051007',
        }}>V</div>
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:'#f1f5f9', lineHeight:1.2 }}>{t.appTitle}</div>
          <div style={{ fontSize:10, color:'#475569' }}>Quality Control System v1.0</div>
        </div>
      </div>

      {/* session meta — only when logged in */}
      {session.isLoggedIn && (
        <div style={{ display:'flex', gap:18, flex:1 }}>
          {[
            ['Layers', '3'],
            ['Cores', '1'],
            ['Ölçüm birimi', 'mm'],
          ].map(([k, v]) => (
            <div key={k} style={{ display:'flex', flexDirection:'column' }}>
              <span style={{ fontSize:10, color:'#475569' }}>{k}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8' }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
        {/* lang toggle */}
        <button
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          style={{
            background:'#1e2330', border:'1px solid #262d3a',
            color:'#4ade80', padding:'5px 12px', borderRadius:6,
            fontWeight:700, fontSize:12, cursor:'pointer',
          }}
        >
          🌐 {lang.toUpperCase()}
        </button>

        {session.isLoggedIn && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:28, height:28, borderRadius:'50%',
                background:'#1e2330', border:'1px solid #262d3a',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14,
              }}>👤</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#f1f5f9' }}>{session.username}</div>
                <div style={{ fontSize:10, color:'#475569' }}>{session.role}</div>
              </div>
            </div>

            {session.role === 'ADMIN' && (
              <button
                onClick={() => setActiveScreen('admin')}
                style={{ background:'#1e3a5f', border:'1px solid #1d4ed8', color:'#60a5fa', padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}
              >
                ⚙️ Admin
              </button>
            )}

            <button
              onClick={logout}
              style={{ background:'#4c0519', border:'1px solid #f43f5e', color:'#f43f5e', padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}
            >
              → {t.logout}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
