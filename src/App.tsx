import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RegistrationScreen from './components/RegistrationScreen';
import ParticipantScreen from './components/ParticipantScreen';
import CuratorScreen from './components/CuratorScreen';
import AdminScreen from './components/AdminScreen';
import { UsersProvider, useUsers, User } from './UsersProvider';
import { parseQrPayload } from './qrPayload';
import { Preloader, PerspectiveGrid, BlinkingSquares, FilmGrain, Vignette } from './components/animations';

type Screen = 'registration' | 'participant' | 'curator' | 'admin';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('registration');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPreloader, setShowPreloader] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  const { getUserById, loading, error, retry } = useUsers();

  useEffect(() => {
    const hasSeenPreloader = sessionStorage.getItem('preloader_shown');
    if (!hasSeenPreloader) {
      setShowPreloader(true);
    }
  }, []);

  // Handle launch parameters from URL (VK deep link)
  useEffect(() => {
    if (loading || currentScreen !== 'registration') return;

    const params = new URLSearchParams(window.location.search);
    const qrParam = params.get('qr');
    
    if (qrParam) {
      const userId = parseQrPayload(qrParam);
      if (userId) {
        const user = getUserById(userId);
        if (user) {
          setCurrentUser(user);
          setCurrentScreen(user.role);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          setShowError('QR-код не распознан');
        }
      } else {
        setShowError('QR-код не распознан');
      }
    }
  }, [loading, currentScreen, getUserById]);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    sessionStorage.setItem('preloader_shown', 'true');
  };

  const handleLogin = (userId: string) => {
    const user = getUserById(userId);
    if (!user) {
      setShowError('Пользователь с данным ID не найден в системе!');
      return;
    }
    setCurrentUser(user);
    setCurrentScreen(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('registration');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-night-sky crt-scanlines flex justify-center relative">
        <PerspectiveGrid />
        <BlinkingSquares />
        <div className="bg-lens" />
        <div className="vignette-strong" />
        <FilmGrain />
        <div className="w-full max-w-[430px] min-h-screen relative z-10 flex items-center justify-center">
          <div className="crt-frame min-h-screen flex items-center justify-center p-4">
            <div className="hud-box" style={{ width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', padding: '40px 0' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid rgba(111, 227, 236, 0.3)',
                  borderTopColor: '#6FE3EC',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
                <p className="text-neon-cyan fit-flow fit-sub" style={{ marginTop: '16px', textAlign: 'center' }}>
                  Загрузка...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-night-sky crt-scanlines flex justify-center relative">
        <PerspectiveGrid />
        <BlinkingSquares />
        <div className="bg-lens" />
        <div className="vignette-strong" />
        <FilmGrain />
        <div className="w-full max-w-[430px] min-h-screen relative z-10 flex items-center justify-center">
          <div className="crt-frame min-h-screen flex items-center justify-center p-4">
            <div className="hud-box" style={{ width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', padding: '20px', gap: '16px' }}>
                <p className="text-white font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35, textAlign: 'center' }}>
                  {error}
                </p>
                <button
                  onClick={retry}
                  className="btn-neon btn-cyan modal-btn"
                  style={{ width: '100%' }}
                >
                  Повторить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-sky crt-scanlines flex justify-center relative">
      {/* Боке-слой */}
      <div className="boke-spot boke-spot-1" />
      <div className="boke-spot boke-spot-2" />
      <div className="boke-spot boke-spot-3" />
      <div className="boke-spot boke-spot-4" />
      <div className="boke-spot boke-spot-5" />

      {/* Глобальные слои */}
      <PerspectiveGrid />
      <BlinkingSquares />
      <div className="bg-lens" />
      <div className="vignette-strong" />
      <FilmGrain />

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

      {/* Error modal */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p className="text-white font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
              {showError}
            </p>
            <button
              onClick={() => setShowError(null)}
              className="btn-neon btn-pink modal-btn"
            >
              ПОНЯТНО
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <UsersProvider>
      <AppContent />
    </UsersProvider>
  );
}

export default App;
