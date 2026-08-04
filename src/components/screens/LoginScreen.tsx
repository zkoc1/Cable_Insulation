import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setSession, setActiveScreen, lang } = useAppStore();
  const t = translations[lang];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Kullanıcı adı giriniz'); return; }
    setError('');
    const role = username.toLowerCase() === 'admin' ? 'ADMIN' : 'OPERATOR';
    setSession({ username, role, isLoggedIn: true });
    setActiveScreen('measurement');
  };

  return (
    <div style={{
      height: 'calc(100vh - 62px)',
      background: '#f0f2f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:32, width:380 }}>
        {/* Logo */}
        <div style={{ textAlign:'center' }}>
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:'linear-gradient(135deg,#4caf50,#2e7d32)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:42, fontWeight:900, color:'#fff',
            margin:'0 auto 14px',
            boxShadow:'0 4px 20px rgba(76,175,80,0.4)',
          }}>V</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1a2a1a' }}>VisioCablePro</div>
          <div style={{ color:'#667766', fontSize:13, marginTop:4 }}>{t.loginSubtitle}</div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{
          background:'#fff',
          border:'1px solid #d0d7d0',
          borderRadius:10,
          padding:'32px 28px',
          width:'100%',
          boxShadow:'0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ margin:'0 0 24px 0', color:'#1a2a1a', fontSize:17, fontWeight:700 }}>{t.loginTitle}</h3>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:13, color:'#445544', fontWeight:600, marginBottom:6 }}>{t.username}</label>
            <input
              type="text"
              value={username}
              placeholder="operator / admin"
              onChange={e => setUsername(e.target.value)}
              style={{
                width:'100%', padding:'10px 12px',
                border:`1px solid ${error ? '#c62828' : '#d0d7d0'}`, borderRadius:6,
                fontSize:14, color:'#1a2a1a', background:'#fafafa',
              }}
            />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:13, color:'#445544', fontWeight:600, marginBottom:6 }}>{t.password}</label>
            <input
              type="password"
              value={password}
              placeholder="••••"
              onChange={e => setPassword(e.target.value)}
              style={{
                width:'100%', padding:'10px 12px',
                border:'1px solid #d0d7d0', borderRadius:6,
                fontSize:14, color:'#1a2a1a', background:'#fafafa',
              }}
            />
          </div>

          {error && <div style={{ color:'#c62828', fontSize:12, marginBottom:12 }}>⚠ {error}</div>}

          <button type="submit" style={{
            width:'100%', padding:'12px',
            background:'linear-gradient(90deg,#4caf50,#388e3c)',
            border:'none', borderRadius:7,
            color:'#fff', fontWeight:800, fontSize:15,
            boxShadow:'0 2px 8px rgba(76,175,80,0.35)',
          }}>
            {t.loginBtn} →
          </button>

          <div style={{ marginTop:14, fontSize:11, color:'#99aa99', textAlign:'center' }}>
            Operatör girişi: herhangi kullanıcı adı &nbsp;|&nbsp; Admin: "admin"
          </div>
        </form>
      </div>
    </div>
  );
};
