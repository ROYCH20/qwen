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
    <div className="min-h-screen bg-retro-dark flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative retro-grid overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-5 text-4xl opacity-20 float-animation">★</div>
          <div className="absolute top-32 right-8 text-3xl opacity-15 float-animation" style={{ animationDelay: '1s' }}>✦</div>
          <div className="absolute top-60 left-12 text-2xl opacity-10 float-animation" style={{ animationDelay: '2s' }}>◆</div>
        </div>

        {/* Content */}
        <div className="relative z-10 pb-20">
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

        {/* Logout button at bottom */}
        {currentUser && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 z-50">
            <button
              onClick={handleLogout}
              className="btn-retro btn-retro-red w-full py-3 text-sm tracking-widest"
            >
              ◄ ВЫЙТИ ►
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
