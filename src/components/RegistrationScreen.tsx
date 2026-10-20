import { useState } from 'react';
import { useUsers } from '../UsersProvider';
import { parseQrPayload } from '../qrPayload';
import { DEMO_ACCESS } from '../config';
import { ScanLine } from 'lucide-react';
import { SignalType, NeonReveal, AnimatedList, AnimatedListItem } from './animations';
import ScannerOverlay from '../ScannerOverlay';

interface Props {
  onLogin: (userId: string) => void;
}

export default function RegistrationScreen({ onLogin }: Props) {
  const [showScanner, setShowScanner] = useState(false);
  const [showCameraError, setShowCameraError] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [showQrError, setShowQrError] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const { getUserById } = useUsers();

  // Обработка успешного сканирования
  const handleDecoded = (rawText: string) => {
    setShowScanner(false);

    const userId = parseQrPayload(rawText);
    if (!userId) {
      setShowQrError(true);
      return;
    }

    const user = getUserById(userId);
    if (!user) {
      setShowQrError(true);
      return;
    }

    onLogin(user.id);
  };

  // Обработка ошибки камеры
  const handleCameraError = (_err: Error, permissionDenied: boolean) => {
    setShowScanner(false);
    setIsPermissionDenied(permissionDenied);
    setShowCameraError(true);
  };

  // Обработка таймаута сканирования
  const handleTimeout = () => {
    setShowScanner(false);
    setShowTimeout(true);
  };

  // Гостевой экран (DEMO_ACCESS === false)
  if (!DEMO_ACCESS) {
    return (
      <div style={{ paddingTop: '24px' }}>
        {/* Заголовок */}
        <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
          <h1 className="text-chrome text-center" style={{ fontSize: 'clamp(13px, calc((100cqw - 32px) / 18.4), 26px)', whiteSpace: 'nowrap', lineHeight: 1.2, fontWeight: 700 }}>
            <SignalType>Посвящение 2026</SignalType>
          </h1>
          <p className="text-neon-cyan fit-flow fit-sub text-center" style={{ marginTop: '4px' }}>
            <SignalType>Веб-сервис посвящения первокурсников</SignalType>
          </p>
        </div>

        {/* Как это работает */}
        <NeonReveal>
          <div className="hud-box">
            <span className="hud-label fit-flow fit-title text-center">КАК ЭТО РАБОТАЕТ</span>
            <p className="fit-flow text-center" style={{ fontSize: 'clamp(11px, 3vw, 12px)', lineHeight: 1.4, color: '#B9B0E6', padding: '0 16px' }}>
              У каждого участника — персональный QR-код и баланс баллов, которые начисляются за активность на мероприятии: конкурсы, задания и командные испытания. Кураторы групп сканируют коды и ведут счет, организаторы видят общий рейтинг. Чтобы войти, отсканируй свой QR-код или обратись к куратору своей группы.
            </p>
          </div>
        </NeonReveal>

        {/* Кнопка входа по QR */}
        <button
          onClick={() => setShowScanner(true)}
          className="btn-neon btn-cyan bottom-pill"
          style={{ width: '100%' }}
        >
          <ScanLine size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
          <span className="fit-btn-m">Я участник — войти по QR</span>
        </button>

        {/* Ссылка на политику конфиденциальности */}
        <div className="text-center" style={{ marginTop: '16px' }}>
          <a href="/privacy.html" style={{ fontSize: '10px', color: '#B9B0E6', textDecoration: 'underline' }}>
            Политика конфиденциальности
          </a>
        </div>

        {/* Оверлей сканера */}
        {showScanner && (
          <ScannerOverlay
            onDecoded={handleDecoded}
            onCameraError={handleCameraError}
            onTimeout={handleTimeout}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Модалка ошибки камеры */}
        {showCameraError && (
          <div className="modal-overlay" style={{ zIndex: 210 }}>
            <div className="modal-card">
              <p className="fit-flow text-center" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
                {isPermissionDenied
                  ? 'Вы запретили доступ к камере. Попробуйте еще раз.'
                  : 'Не удалось получить доступ к камере. Попробуйте еще раз.'}
              </p>
              <p className="fit-flow text-center" style={{ fontSize: 'clamp(10px, 2.8vw, 11px)', color: '#B9B0E6', lineHeight: 1.3 }}>
                {isPermissionDenied
                  ? 'Разрешите доступ к камере в настройках браузера или откройте приложение в мобильном приложении VK.'
                  : 'В веб-версии доступ к камере может быть ограничен. Откройте приложение в мобильном приложении VK.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <button
                  onClick={() => {
                    setShowCameraError(false);
                    setShowScanner(true);
                  }}
                  className="btn-neon btn-cyan modal-btn"
                >
                  Попробовать еще раз
                </button>
                <button
                  onClick={() => setShowCameraError(false)}
                  className="btn-neon btn-ghost modal-btn"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модалка неверного QR */}
        {showQrError && (
          <div className="modal-overlay" style={{ zIndex: 210 }}>
            <div className="modal-card">
              <p className="fit-flow text-center" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
                Отсканирован неверный QR-код. Проверьте код и попробуйте еще раз.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <button
                  onClick={() => {
                    setShowQrError(false);
                    setShowScanner(true);
                  }}
                  className="btn-neon btn-cyan modal-btn"
                >
                  Попробовать еще раз
                </button>
                <button
                  onClick={() => setShowQrError(false)}
                  className="btn-neon btn-ghost modal-btn"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модалка таймаута сканирования */}
        {showTimeout && (
          <div className="modal-overlay" style={{ zIndex: 210 }}>
            <div className="modal-card">
              <p className="fit-flow text-center" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
                Не удалось отсканировать QR-код. Попробуйте еще раз.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <button
                  onClick={() => {
                    setShowTimeout(false);
                    setShowScanner(true);
                  }}
                  className="btn-neon btn-cyan modal-btn"
                >
                  Попробовать еще раз
                </button>
                <button
                  onClick={() => setShowTimeout(false)}
                  className="btn-neon btn-ghost modal-btn"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Демо-режим (DEMO_ACCESS === true)
  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="text-chrome" style={{ fontSize: 'clamp(13px, calc((100cqw - 32px) / 18.4), 26px)', whiteSpace: 'nowrap', lineHeight: 1.2, fontWeight: 700 }}>
          <SignalType>ПОСВЯЩЕНИЕ 2026</SignalType>
        </h1>
        <p className="text-neon-lilac fit-flow fit-sub" style={{ marginTop: '4px' }}>
          <SignalType>Вход в аккаунт</SignalType>
        </p>
      </div>

      {/* Вход по QR */}
      <NeonReveal>
        <div className="hud-box">
          <span className="hud-label fit-flow fit-title">ВХОД ПО QR</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button onClick={() => setShowScanner(true)} className="btn-neon btn-cyan focus-glow">
              <ScanLine size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
              <span className="fit-btn-m">Открыть камеру</span>
            </button>
            <p className="fit-flow text-center" style={{ fontSize: '10px', color: '#B9B0E6', lineHeight: 1.3 }}>
              Наведите камеру на ваш персональный QR-код
            </p>
          </div>
        </div>
      </NeonReveal>

      {/* Быстрый доступ (только в демо-режиме) */}
      <div style={{ marginBottom: 'var(--gap-block)' }}>
        <p className="center-col text-neon-lilac fit-flow fit-sub" style={{ marginBottom: '12px', fontWeight: 500 }}>
          Быстрый доступ
        </p>
        <AnimatedList className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
          <AnimatedListItem>
            <button onClick={() => onLogin('P001')} className="btn-neon btn-cyan">
              <span className="fit-nowrap fit-btn3">Участник</span>
            </button>
          </AnimatedListItem>
          <AnimatedListItem>
            <button onClick={() => onLogin('C001')} className="btn-neon btn-lilac">
              <span className="fit-nowrap fit-btn3">Куратор</span>
            </button>
          </AnimatedListItem>
          <AnimatedListItem>
            <button onClick={() => onLogin('A001')} className="btn-neon btn-danger">
              <span className="fit-nowrap fit-btn3">Админ</span>
            </button>
          </AnimatedListItem>
        </AnimatedList>
      </div>

      {/* Ссылка на политику конфиденциальности */}
      <div className="text-center" style={{ marginTop: '16px' }}>
        <a href="/privacy.html" style={{ fontSize: '10px', color: '#B9B0E6', textDecoration: 'underline' }}>
          Политика конфиденциальности
        </a>
      </div>

      {/* Оверлей сканера */}
      {showScanner && (
        <ScannerOverlay
          onDecoded={handleDecoded}
          onCameraError={handleCameraError}
          onTimeout={handleTimeout}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Модалка ошибки камеры */}
      {showCameraError && (
        <div className="modal-overlay" style={{ zIndex: 210 }}>
          <div className="modal-card">
            <p className="fit-flow text-center" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
              {isPermissionDenied
                ? 'Вы запретили доступ к камере. Попробуйте еще раз.'
                : 'Не удалось получить доступ к камере. Попробуйте еще раз.'}
            </p>
            <p className="fit-flow text-center" style={{ fontSize: 'clamp(10px, 2.8vw, 11px)', color: '#B9B0E6', lineHeight: 1.3 }}>
              {isPermissionDenied
                ? 'Разрешите доступ к камере в настройках браузера или откройте приложение в мобильном приложении VK.'
                : 'В веб-версии доступ к камере может быть ограничен. Откройте приложение в мобильном приложении VK.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                onClick={() => {
                  setShowCameraError(false);
                  setShowScanner(true);
                }}
                className="btn-neon btn-cyan modal-btn"
              >
                Попробовать еще раз
              </button>
              <button
                onClick={() => setShowCameraError(false)}
                className="btn-neon btn-ghost modal-btn"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка неверного QR */}
      {showQrError && (
        <div className="modal-overlay" style={{ zIndex: 210 }}>
          <div className="modal-card">
            <p className="fit-flow text-center" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
              Отсканирован неверный QR-код. Проверьте код и попробуйте еще раз.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                onClick={() => {
                  setShowQrError(false);
                  setShowScanner(true);
                }}
                className="btn-neon btn-cyan modal-btn"
              >
                Попробовать еще раз
              </button>
              <button
                onClick={() => setShowQrError(false)}
                className="btn-neon btn-ghost modal-btn"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка таймаута сканирования */}
      {showTimeout && (
        <div className="modal-overlay" style={{ zIndex: 210 }}>
          <div className="modal-card">
            <p className="fit-flow text-center" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
              Не удалось отсканировать QR-код. Попробуйте еще раз.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                onClick={() => {
                  setShowTimeout(false);
                  setShowScanner(true);
                }}
                className="btn-neon btn-cyan modal-btn"
              >
                Попробовать еще раз
              </button>
              <button
                onClick={() => setShowTimeout(false)}
                className="btn-neon btn-ghost modal-btn"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
