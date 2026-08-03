import React from 'react';
import { useAppStore } from './store/useAppStore';
import { TopBar } from './components/layout/TopBar';
import { LoginScreen } from './components/screens/LoginScreen';
import { MeasurementScreen } from './components/screens/MeasurementScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { AdminScreen } from './components/screens/AdminScreen';

export const App: React.FC = () => {
  const { activeScreen } = useAppStore();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a0f',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
    }}>
      <TopBar />

      {activeScreen === 'login' && <LoginScreen />}
      {activeScreen === 'measurement' && <MeasurementScreen />}
      {activeScreen === 'result' && <ResultScreen />}
      {activeScreen === 'admin' && <AdminScreen />}
    </div>
  );
};

export default App;
