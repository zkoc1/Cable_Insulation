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
    if (!username.trim()) { setError('Kullanıcı adı boş bırakılamaz.'); return; }
    setError('');
    const role = username.toLowerCase() === 'admin' ? 'ADMIN' : 'OPERATOR';
    setSession({ username, role, isLoggedIn: true });
    setActiveScreen('measurement');
  };

  return (
    <div style={{
      height: 'calc(100vh - 54px)',
      background: '#eef0ee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#fff',
        border: '1px solid #c8d0c8',
        borderRadius: 8,
        padding: '36px 32px',
        width: 360,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, color: '#1a2a1a', fontWeight: 700 }}>
          Kablo Yalıtım Ölçüm
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 12, color: '#7a8a7a' }}>
          {t.loginSubtitle}
        </p>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5a4a', marginBottom: 5 }}>
          {t.username}
        </label>
        <input
          type="text"
          value={username}
          placeholder="operator / admin"
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px', marginBottom: 14,
            border: '1px solid #c8d0c8', borderRadius: 5, fontSize: 13,
          }}
        />

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5a4a', marginBottom: 5 }}>
          {t.password}
        </label>
        <input
          type="password"
          value={password}
          placeholder="••••"
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px', marginBottom: 20,
            border: '1px solid #c8d0c8', borderRadius: 5, fontSize: 13,
          }}
        />

        {error && (
          <div style={{ color: '#c62828', fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>
        )}

        <button type="submit" style={{
          width: '100%', padding: '11px',
          background: '#3d8b40', border: 'none', borderRadius: 6,
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          {t.loginBtn}
        </button>
      </form>
    </div>
  );
};
