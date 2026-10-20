import { useState, useEffect, useRef } from 'react';
import { useUsers } from '../UsersProvider';
import { parseQrPayload } from '../qrPayload';
import { DEMO_ACCESS } from '../config';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine } from 'lucide-react';
import { SignalType, NeonReveal, AnimatedList, AnimatedListItem } from './animations';

interface Props {
  onLogin: (userId: string) => void;
}

export default function RegistrationScreen({ onLogin }: Props) {
  const [showError, setShowError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-registration';
  const { getUserById } = useUsers();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setShowError('');
    setCameraError(null);
    
    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const userId = parseQrPayload(decodedText);
          
          if (userId) {
            const user = getUserById(userId);
            
            if (user) {
              scanner.stop().catch(() => {});
              setIsScanning(false);
              onLogin(user.id);
            } else {
              setShowError('QR-код не распознан');
              scanner.stop().catch(() => {});
              setIsScanning(false);
            }
          } else {
            setShowError('QR-код не распознан');
            scanner.stop().catch(() => {});
            setIsScanning(false);
          }
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      const errorMessage = err instanceof Error ? err.name : '';
      
      if (['NotAllowedError', 'SecurityError', 'NotFoundError', 'OverconstrainedError'].includes(errorMessage)) {
        setCameraError('Камера недоступна в веб-версии. Откройте приложение в мобильном приложении VK, чтобы сканировать QR-код.');
      } else {
        setCameraError('Не удалось получить доступ к камере.');
      }
      setIsScanning(false);
    }
  };

  // Гостевой экран (DEMO_ACCESS === false)
  if (!DEMO_ACCESS && !isScanning) {
    return (
      <div style={{ paddingTop: '24px' }}>
        {/* Заголовок */}
        <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
          <h1 className="text-chrome" style={{ fontSize: 'clamp(13px, calc((100cqw - 32px) / 18.4), 26px)', whiteSpace: 'nowrap', lineHeight: 1.2, fontWeight: 700 }}>
            <SignalType>ПОСВЯЩЕНИЕ 2026</SignalType>
          </h1>
          <p className="text-neon-cyan fit-flow fit-sub" style={{ marginTop: '4px' }}>
            <SignalType>Веб-сервис посвящения первокурсников</SignalType>
          </p>
        </div>

        {/* Как это работает */}
        <NeonReveal>
          <div className="hud-box">
            <span className="hud-label fit-flow fit-title">КАК ЭТО РАБОТАЕТ</span>
            <p className="fit-flow" style={{ fontSize: 'clamp(11px, 3vw, 12px)', lineHeight: 1.4, color: '#B9B0E6' }}>
              У каждого участника — персональный QR-код и баланс баллов, которые начисляются за активность на мероприятии: конкурсы, задания и командные испытания. Кураторы групп сканируют коды и ведут счёт, организаторы видят общий рейтинг. Чтобы войти, отсканируй свой QR-код или обратись к куратору своей группы.
            </p>
          </div>
        </NeonReveal>

        {/* Кнопка входа по QR */}
        <button
          onClick={() => setIsScanning(true)}
          className="btn-neon btn-cyan bottom-pill"
          style={{ width: '100%' }}
        >
          <ScanLine size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
          <span className="fit-btn-m">Я участник — войти по QR</span>
        </button>

        {/* Ссылка на политику конфиденциальности */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a href="/privacy.html" style={{ fontSize: '10px', color: '#B9B0E6', textDecoration: 'underline' }}>
            Политика конфиденциальности
          </a>
        </div>
      </div>
    );
  }

  // Режим сканирования
  if (isScanning) {
    return (
      <div style={{ paddingTop: '24px' }}>
        {/* Заголовок */}
        <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
          <h1 className="screen-title text-chrome">
            <SignalType>ВХОД ПО QR</SignalType>
          </h1>
        </div>

        {/* Сканер */}
        <NeonReveal>
          <div className="hud-box">
            {cameraError ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p className="fit-flow" style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
                  {cameraError}
                </p>
                {DEMO_ACCESS && (
                  <button
                    onClick={() => {
                      setCameraError(null);
                      setIsScanning(false);
                    }}
                    className="btn-neon btn-ghost"
                  >
                    <span className="fit-btn-m">Назад</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="qr-frame focus-glow">
                  <div id={scannerContainerId} className="overflow-hidden"></div>
                </div>
                <button
                  onClick={() => {
                    if (scannerRef.current) {
                      scannerRef.current.stop().catch(() => {});
                    }
                    setIsScanning(false);
                  }}
                  className="btn-neon btn-danger"
                >
                  <span className="fit-btn-m">Отменить</span>
                </button>
              </div>
            )}
          </div>
        </NeonReveal>

        {/* Модальное окно ошибки */}
        {showError && (
          <div className="overlay-shell">
            <div className="w-full max-w-[430px] mx-auto">
              <div className="hud-box">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                  <p className="fit-flow" style={{ fontSize: 'clamp(14px, 4vw, 16px)', lineHeight: 1.4 }}>
                    {showError}
                  </p>
                  <button
                    onClick={() => setShowError('')}
                    className="btn-neon btn-pink"
                    style={{ width: '100%' }}
                  >
                    ПОНЯТНО
                  </button>
                </div>
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
            <button onClick={startScanner} className="btn-neon btn-cyan focus-glow">
              <ScanLine size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
              <span className="fit-btn-m">Открыть камеру</span>
            </button>
            <p style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
              Наведите камеру на ваш персональный QR-код
            </p>
          </div>
        </div>
      </NeonReveal>

      {/* Быстрый доступ (только в демо-режиме) */}
      {DEMO_ACCESS && (
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
      )}

      {/* Ссылка на политику конфиденциальности */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <a href="/privacy.html" style={{ fontSize: '10px', color: '#B9B0E6', textDecoration: 'underline' }}>
          Политика конфиденциальности
        </a>
      </div>

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="overlay-shell">
          <div className="w-full max-w-[430px] mx-auto">
            <div className="hud-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                <p className="fit-flow" style={{ fontSize: 'clamp(14px, 4vw, 16px)', lineHeight: 1.4 }}>
                  {showError}
                </p>
                <button
                  onClick={() => setShowError('')}
                  className="btn-neon btn-pink"
                  style={{ width: '100%' }}
                >
                  ПОНЯТНО
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
