import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../core/i18n/translations';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('1234');
  const { setSession, setActiveScreen, lang } = useAppStore();
  const t = translations[lang];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === 'admin') {
      setSession({ username: 'Admin User', role: 'ADMIN', isLoggedIn: true });
    } else {
      setSession({ username: username || 'Operator User', role: 'OPERATOR', isLoggedIn: true });
    }
    setActiveScreen('measurement');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#0a0a0f',
      color: '#f1f5f9'
    }}>
      <form onSubmit={handleLogin} style={{
        backgroundColor: '#111118',
        border: '1px solid #2a2a38',
        borderRadius: '12px',
        padding: '40px',
        width: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#4ade80', fontSize: '24px' }}>{t.loginTitle}</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{t.loginSubtitle}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
            {t.username}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1a1a24',
              border: '1px solid #2a2a38',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
            {t.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1a1a24',
              border: '1px solid #2a2a38',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
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
          {t.loginBtn}
        </button>
      </form>
    </div>
  );
};
