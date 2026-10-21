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

  const { getUserById, getUserByVkId, bindVkId, loading, error, retry, saveSession, restoreSession, users } = useUsers();

  // Показываем преLoader при первом запуске
  useEffect(() => {
    const hasSeenPreloader = sessionStorage.getItem('preloader_shown');
    if (!hasSeenPreloader) {
      setShowPreloader(true);
    }
  }, []);

  // v17.8: слежение за сессией текущего пользователя (login/logout/удаление).
  // При удалении залогиненного участника админом — тихий выход на гостевой
  // экран без краша + автоматическая очистка localStorage (С5).
  useEffect(() => {
    if (loading) return;
    if (currentUser) {
      const fresh = getUserById(currentUser.id);
      if (!fresh) {
        // Пользователь удален из базы -> чистим мусор и сбрасываем сессию
        saveSession(null);
        setCurrentUser(null);
        setCurrentScreen('registration');
        return;
      }
      // Баланс/ФИО в currentUser обновляются из свежего стора (realtime-подписка
      // UsersProvider обновляет users -> здесь прокидываем актуального юзера)
      if (fresh.points !== currentUser.points || fresh.full_name !== currentUser.full_name) {
        setCurrentUser(fresh);
      }
    }
  }, [loading, users]); // eslint-disable-line react-hooks/exhaustive-deps

  // Автологин после загрузки данных
  useEffect(() => {
    if (loading || autoLoginAttempted) return;

    const attemptAutoLogin = async () => {
      setAutoLoginAttempted(true);

      // Приоритет 0 (v17.8): сохраненная сессия из localStorage.
      // Выше launch-параметра ?qr= и vk_id: если uid валиден в свежей базе,
      // НЕ показываем гостевой экран и НЕ требуем повторного скана, даже
      // если в URL есть старый ?qr=P001.
      const savedUid = restoreSession();
      if (savedUid) {
        const savedUser = getUserById(savedUid);
        if (savedUser) {
          setCurrentUser(savedUser);
          setCurrentScreen(savedUser.role);
          // Чистим устаревший ?qr= из URL, не ломая сам паттерн replaceState
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }
        // savedUid есть, но user deleted/not found -> чистим мусор
        saveSession(null);
      }

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
            saveSession(user.id); // v17.8: вход по ?qr= тоже запоминается
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
          saveSession(user.id); // v17.8: вход по vk_id тоже запоминается
          return;
        }
      }

      // Приоритет 3: показываем экран регистрации
    };

    attemptAutoLogin();
  }, [loading, autoLoginAttempted, getUserById, getUserByVkId, bindVkId, saveSession, restoreSession]);

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
    saveSession(user.id); // v17.8: любой успешный вход запоминается
    
    // Привязываем VK ID при успешном входе
    const vkId = await getVkUserId();
    if (vkId) {
      await bindVkId(user.id, vkId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('registration');
    saveSession(null); // v17.8: logout всегда очищает localStorage
  };

  // ПреLoader
  if (showPreloader) {
    return <CrtPreloader onComplete={handlePreloaderComplete} />;
  }

  // Loading state с скелетонами
  if (loading) {
    return (
      // v17.6-mobile-fix-v2: .bg-layer (position:fixed) УДАЛЕН — fixed-слой
      // отрывается на iOS при инерции скролла. Фон рисует #root (background,
      // position:relative); .bg-night-sky дублирует градиент на этом экране.
      <div className="h-full bg-night-sky crt-scanlines relative app-frame">
        <PerspectiveGrid />
        <BlinkingSquares />
        <div className="bg-lens" />
        <div className="vignette-strong" />
        <FilmGrain />
        {/* v17.6-mobile-fix-v2: .overlay-shell (relative flex-ребенок) +
            единственный скроллящийся .screen-container внутри */}
        <div className="overlay-shell" style={{ zIndex: 10 }}>
          <div className="screen-container w-full max-w-[430px] mx-auto">
            <div className="crt-frame p-4">
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
      <div className="h-full bg-night-sky crt-scanlines relative app-frame">
        <PerspectiveGrid />
        <BlinkingSquares />
        <div className="bg-lens" />
        <div className="vignette-strong" />
        <FilmGrain />
        {/* v17.6-mobile-fix-v2: тот же паттерн — overlay-shell в потоке,
            скролл только у .screen-container */}
        <div className="overlay-shell" style={{ zIndex: 10 }}>
          <div className="screen-container w-full max-w-[430px] mx-auto">
            <div className="crt-frame flex items-center justify-center p-4" style={{ minHeight: '100%' }}>
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
    <div className="h-full bg-night-sky crt-scanlines relative app-frame">
      {/* Фоновые слои. v17.6-mobile-fix-v2: .bg-layer (fixed) УДАЛЕН — фон
          рисует #root; декоративные fixed-слои вне потока скролла безопасны. */}
      <PerspectiveGrid />
      <BlinkingSquares />
      <div className="bg-lens" />
      <div className="vignette-strong" />
      <FilmGrain />

      {/* Единственный скроллящийся элемент приложения (flex:1 + min-height:0) */}
      <div className="screen-container w-full max-w-[430px] mx-auto relative" style={{ zIndex: 10 }}>
        {/* CRT-рамка */}
        <div className="crt-frame" style={{ minHeight: '100%' }}>
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
