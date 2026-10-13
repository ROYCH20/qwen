import { useState } from 'react';
import RegistrationScreen from './components/RegistrationScreen';
import ParticipantScreen from './components/ParticipantScreen';
import CuratorScreen from './components/CuratorScreen';
import AdminScreen from './components/AdminScreen';
import { getUserById, User } from './database';

type Screen = 'registration' | 'participant' | 'curator' | 'admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('registration');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (userId: string) => {
    const user = getUserById(userId);
    if (!user) {
      alert('Пользователь с данным ID не найден в системе!');
      return;
    }
    setCurrentUser(user);
    setCurrentScreen(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('registration');
  };

  return (
    <div className="min-h-screen bg-violet-soft flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative overflow-hidden">
        {/* Background decorations */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-10 left-6 text-3xl opacity-20 float-animation" style={{ color: '#8b5cf6' }}>✦</div>
          <div className="absolute top-28 right-8 text-2xl opacity-15 float-animation-delayed" style={{ color: '#a78bfa' }}>✧</div>
          <div className="absolute top-52 left-10 text-2xl opacity-10 float-animation" style={{ color: '#c4b5fd', animationDelay: '1.5s' }}>◆</div>
          <div className="absolute bottom-32 right-6 text-3xl opacity-15 float-animation-delayed" style={{ color: '#8b5cf6' }}>✦</div>
          <div className="absolute bottom-48 left-8 text-2xl opacity-10 float-animation" style={{ color: '#a78bfa', animationDelay: '2s' }}>✧</div>
          {/* Soft gradient blobs */}
          <div className="absolute top-20 -right-20 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}></div>
          <div className="absolute top-96 -left-20 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }}></div>
          <div className="absolute bottom-40 -right-10 w-52 h-52 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 pb-6">
          {currentScreen === 'registration' && (
            <RegistrationScreen onLogin={handleLogin} />
          )}
          {currentScreen === 'participant' && currentUser && (
            <ParticipantScreen user={currentUser} onLogout={handleLogout} />
          )}
          {currentScreen === 'curator' && currentUser && (
            <CuratorScreen user={currentUser} onLogout={handleLogout} />
          )}
          {currentScreen === 'admin' && currentUser && (
            <AdminScreen user={currentUser} onLogout={handleLogout} />
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
