import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';

export const TopBar: React.FC = () => {
  const { session, lang, setLang, logout, setActiveScreen } = useAppStore();
  const t = translations[lang];

  return (
    <div style={{
      height: 62,
      background: 'linear-gradient(90deg, #1a1f1a 0%, #243024 100%)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 14,
      borderBottom: '3px solid #4caf50',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, paddingRight:14, borderRight:'1px solid #3a4a3a' }}>
        <div style={{
          width:40, height:40, borderRadius:'50%',
          background:'#4caf50',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:900, fontSize:22, color:'#1a1f1a',
        }}>V</div>
        <div>
          <div style={{ color:'#e8f5e9', fontWeight:700, fontSize:13, letterSpacing:.5 }}>VisioCablePro</div>
          <div style={{ color:'#81c784', fontSize:10 }}>Kablo İzolasyon Ölçüm Sistemi</div>
        </div>
      </div>

      {/* Proses bilgileri */}
      {session.isLoggedIn && (
        <div style={{ display:'flex', gap:18, flex:1 }}>
          {[
            ['Layers', '3'],
            ['Temp.', '21°C'],
            ['Ringdurchmesser', '12.0mm'],
            ['Prüfer', session.username],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ color:'#81c784', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>{k}</div>
              <div style={{ color:'#e8f5e9', fontSize:12, fontWeight:600 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
        {/* Lang */}
        <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} style={{
          background:'#2e3d2e', border:'1px solid #4caf50', color:'#81c784',
          padding:'4px 10px', borderRadius:4, fontSize:11, fontWeight:700,
        }}>
          🌐 {lang.toUpperCase()}
        </button>

        {session.isLoggedIn && (
          <>
            <div style={{ color:'#81c784', fontSize:10 }}>{t.role}: <span style={{ color:'#e8f5e9', fontWeight:700 }}>{session.role}</span></div>
            {session.role === 'ADMIN' && (
              <button onClick={() => setActiveScreen('admin')} style={{
                background:'#2e3d2e', border:'1px solid #4caf50', color:'#4caf50',
                padding:'5px 12px', borderRadius:4, fontSize:11, fontWeight:700,
              }}>⚙ Admin</button>
            )}
            <button onClick={logout} style={{
              background:'#3d1f1f', border:'1px solid #c62828', color:'#ef9a9a',
              padding:'5px 12px', borderRadius:4, fontSize:11, fontWeight:700,
            }}>↪ {t.logout}</button>
          </>
        )}
        <span style={{ color:'#4a5a4a', fontSize:10, marginLeft:4 }}>v23.1.27.11</span>
      </div>
    </div>
  );
};
