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
    <div className="min-h-screen bg-night-sky crt-scanlines flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative">
        {/* CRT-рамка */}
        <div className="crt-frame min-h-screen">
          {/* Контент */}
          <div className="relative z-10 p-4 pb-24">
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
    </div>
  );
}

export default App;
