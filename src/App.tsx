import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
    <div className="min-h-screen flex justify-center relative">
      {/* Фоновые слои */}
      <div className="bg-smoke" />
      <div className="prism-flare prism-flare-1" />
      <div className="prism-flare prism-flare-2" />
      <div className="prism-flare prism-flare-3" />
      <div className="prism-flare prism-flare-4" />
      <div className="prism-flare prism-flare-5" />
      <div className="prism-flare prism-flare-6" />
      <div className="scale-ring" />
      <div className="bg-lens" />
      <div className="vignette-strong" />
      <div className="film-grain" />

      <div className="w-full max-w-[430px] min-h-screen relative crt-scanlines" style={{ zIndex: 4 }}>
        {/* Контент с анимацией перехода */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen + (currentUser?.id || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="p-4 pb-24"
          >
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
