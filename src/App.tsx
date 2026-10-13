import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RegistrationScreen from './components/RegistrationScreen';
import ParticipantScreen from './components/ParticipantScreen';
import CuratorScreen from './components/CuratorScreen';
import AdminScreen from './components/AdminScreen';
import { getUserById, User } from './database';
import { Preloader, PerspectiveGrid, BlinkingSquares, FilmGrain, Vignette } from './components/animations';

type Screen = 'registration' | 'participant' | 'curator' | 'admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('registration');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    const hasSeenPreloader = sessionStorage.getItem('preloader_shown');
    if (!hasSeenPreloader) {
      setShowPreloader(true);
    }
  }, []);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    sessionStorage.setItem('preloader_shown', 'true');
  };

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
    <div className="min-h-screen bg-night-sky crt-scanlines flex justify-center relative">
      {/* Глобальные слои */}
      <PerspectiveGrid />
      <BlinkingSquares />
      <FilmGrain />
      <Vignette />

      {/* Preloader */}
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}

      <div className="w-full max-w-[430px] min-h-screen relative z-10">
        {/* CRT-рамка */}
        <div className="crt-frame min-h-screen">
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
    </div>
  );
}

export default App;
