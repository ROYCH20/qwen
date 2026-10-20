import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RegistrationScreen from './components/RegistrationScreen';
import ParticipantScreen from './components/ParticipantScreen';
import CuratorScreen from './components/CuratorScreen';
import AdminScreen from './components/AdminScreen';
import { UsersProvider, useUsers, User } from './UsersProvider';
import { parseQrPayload } from './qrPayload';
import { getVkUserId } from './vk';
import { PerspectiveGrid, BlinkingSquares, FilmGrain, Vignette } from './components/animations';

type Screen = 'registration' | 'participant' | 'curator' | 'admin';

// CRT-преLoader компонент
function CrtPreloader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="crt-preloader">
      <div className="crt-line" />
    </div>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('registration');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPreloader, setShowPreloader] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  const { getUserById, getUserByVkId, bindVkId, loading, error, retry } = useUsers();

  // Показываем преLoader при первом запуске
  useEffect(() => {
    const hasSeenPreloader = sessionStorage.getItem('preloader_shown');
    if (!hasSeenPreloader) {
      setShowPreloader(true);
    }
  }, []);

  // Автологин после загрузки данных
  useEffect(() => {
    if (loading || autoLoginAttempted) return;

    const attemptAutoLogin = async () => {
      setAutoLoginAttempted(true);

      // Приоритет 1: launch-параметр ?qr=
      const params = new URLSearchParams(window.location.search);
      const qrParam = params.get('qr');
      
      if (qrParam) {
        const userId = parseQrPayload(qrParam);
        if (userId) {
          const user = getUserById(userId);
          if (user) {
            setCurrentUser(user);
            setCurrentScreen(user.role);
            window.history.replaceState({}, '', window.location.pathname);
            
            // Привязываем VK ID если доступны
            const vkId = await getVkUserId();
            if (vkId) {
              await bindVkId(user.id, vkId);
            }
            return;
          }
        }
        setShowError('QR-код не распознан');
        return;
      }

      // Приоритет 2: автологин по VK ID
      const vkId = await getVkUserId();
      if (vkId) {
        const user = getUserByVkId(vkId);
        if (user) {
          setCurrentUser(user);
          setCurrentScreen(user.role);
          return;
        }
      }

      // Приоритет 3: показываем экран регистрации
    };

    attemptAutoLogin();
  }, [loading, autoLoginAttempted, getUserById, getUserByVkId, bindVkId]);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    sessionStorage.setItem('preloader_shown', 'true');
  };

  const handleLogin = async (userId: string) => {
    const user = getUserById(userId);
    if (!user) {
      setShowError('Пользователь с данным ID не найден в системе!');
      return;
    }
    setCurrentUser(user);
    setCurrentScreen(user.role);
    
    // Привязываем VK ID при успешном входе
    const vkId = await getVkUserId();
    if (vkId) {
      await bindVkId(user.id, vkId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('registration');
  };

  // ПреLoader
  if (showPreloader) {
    return <CrtPreloader onComplete={handlePreloaderComplete} />;
  }

  // Loading state с скелетонами
  if (loading) {
    return (
      <div className="min-h-screen bg-night-sky crt-scanlines relative">
        <PerspectiveGrid />
        <BlinkingSquares />
        <div className="bg-lens" />
        <div className="vignette-strong" />
        <FilmGrain />
        <div className="overlay-shell" style={{ zIndex: 10 }}>
          <div className="w-full max-w-[430px] mx-auto">
            <div className="crt-frame min-h-screen p-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '24px' }}>
                {/* Скелетон заголовка */}
                <div className="skeleton-box">
                  <div className="skeleton-line" style={{ width: '60%', margin: '0 auto 10px' }} />
                  <div className="skeleton-line" style={{ width: '40%', margin: '0 auto' }} />
                </div>
                
                {/* Скелетон контента */}
                <div className="skeleton-box">
                  <div className="skeleton-line" style={{ width: '80%' }} />
                  <div className="skeleton-line" style={{ width: '60%' }} />
                  <div className="skeleton-line" style={{ width: '70%' }} />
                </div>
                
                {/* Скелетон кнопок */}
                <div className="skeleton-box">
                  <div className="skeleton-line" style={{ width: '100%', height: '44px' }} />
                </div>
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
      <div className="min-h-screen bg-night-sky crt-scanlines relative">
        <PerspectiveGrid />
        <BlinkingSquares />
        <div className="bg-lens" />
        <div className="vignette-strong" />
        <FilmGrain />
        <div className="overlay-shell" style={{ zIndex: 10 }}>
          <div className="w-full max-w-[430px] mx-auto">
            <div className="crt-frame min-h-screen flex items-center justify-center p-4">
              <div className="hud-box" style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p className="fit-flow text-center" style={{ fontSize: 'clamp(14px, 4vw, 16px)', lineHeight: 1.4 }}>
                    {error}
                  </p>
                  <button
                    onClick={retry}
                    className="btn-neon btn-cyan"
                    style={{ width: '100%' }}
                  >
                    Повторить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-sky crt-scanlines relative app-frame">
      {/* Фоновые слои */}
      <PerspectiveGrid />
      <BlinkingSquares />
      <div className="bg-lens" />
      <div className="vignette-strong" />
      <FilmGrain />

      <div className="w-full max-w-[430px] min-h-screen mx-auto relative" style={{ zIndex: 10 }}>
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
              className="p-4 bottom-pill"
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
            <p className="fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
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
