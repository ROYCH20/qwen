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
    <div className="min-h-screen bg-soft-pink flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative overflow-hidden">
        {/* Background decorations */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-10 left-6 text-3xl opacity-30 float-animation" style={{ color: '#ffb6c1' }}>✿</div>
          <div className="absolute top-28 right-8 text-2xl opacity-25 float-animation-delayed" style={{ color: '#c8a2c8' }}>♡</div>
          <div className="absolute top-52 left-10 text-2xl opacity-20 float-animation" style={{ color: '#87ceeb', animationDelay: '1.5s' }}>✧</div>
          <div className="absolute bottom-32 right-6 text-3xl opacity-25 float-animation-delayed" style={{ color: '#98fb98' }}>✿</div>
          <div className="absolute bottom-48 left-8 text-2xl opacity-20 float-animation" style={{ color: '#ffeb99', animationDelay: '2s' }}>♡</div>
          {/* Soft gradient blobs */}
          <div className="absolute top-20 -right-20 w-60 h-60 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ffb6c1, transparent)' }}></div>
          <div className="absolute top-96 -left-20 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #c8a2c8, transparent)' }}></div>
          <div className="absolute bottom-40 -right-10 w-52 h-52 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #87ceeb, transparent)' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 pb-24">
          {currentScreen === 'registration' && (
            <RegistrationScreen onLogin={handleLogin} />
          )}
          {currentScreen === 'participant' && currentUser && (
            <ParticipantScreen user={currentUser} />
          )}
          {currentScreen === 'curator' && currentUser && (
            <CuratorScreen user={currentUser} />
          )}
          {currentScreen === 'admin' && currentUser && (
            <AdminScreen user={currentUser} />
          )}
        </div>

        {/* Logout button at bottom - visible on all screens */}
        {currentUser && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 z-50" style={{ background: 'linear-gradient(0deg, #fef0f5 60%, transparent)' }}>
            <button
              onClick={handleLogout}
              className="btn-soft btn-soft-pink w-full py-3.5 text-base tracking-wider shadow-lg"
            >
              ✿ Выйти ✿
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
