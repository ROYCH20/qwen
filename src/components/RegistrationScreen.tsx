import { useState } from 'react';
import { useUsers } from '../UsersProvider';
import { DEMO_ACCESS } from '../config';
import { ScanLine } from 'lucide-react';
import { SignalType, NeonReveal, AnimatedList, AnimatedListItem } from './animations';
import ScannerOverlay from '../ScannerOverlay';
import ErrorModal from '../ErrorModal';
import { parseQrPayload } from '../qrPayload';

interface Props {
  onLogin: (userId: string) => void;
}

export default function RegistrationScreen({ onLogin }: Props) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [errorKind, setErrorKind] = useState<'denied' | 'unavailable' | 'invalid' | 'timeout' | null>(null);
  const { getUserById } = useUsers();

  // Валидатор входа: сырой decode → валидный id или null.
  // parseQrPayload понимает и диплинк …?qr=P001, и голый id — обратная совместимость.
  const validateLogin = (raw: string) => {
    const id = parseQrPayload(raw);
    return id && getUserById(id) ? id : null;
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
          onClick={() => setScannerOpen(true)}
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
        {scannerOpen && (
          <ScannerOverlay
            validate={validateLogin}
            onResult={(id) => {
              setScannerOpen(false);
              onLogin(id);
            }}
            onError={(kind) => {
              setScannerOpen(false);
              setErrorKind(kind);
            }}
            onCancel={() => setScannerOpen(false)}
          />
        )}

        {/* Единая модалка ошибок */}
        <ErrorModal
          kind={errorKind}
          onRetry={() => {
            setErrorKind(null);
            setScannerOpen(true);
          }}
          onClose={() => setErrorKind(null)}
        />
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
            <button onClick={() => setScannerOpen(true)} className="btn-neon btn-cyan focus-glow">
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
      {scannerOpen && (
        <ScannerOverlay
          validate={validateLogin}
          onResult={(id) => {
            setScannerOpen(false);
            onLogin(id);
          }}
          onError={(kind) => {
            setScannerOpen(false);
            setErrorKind(kind);
          }}
          onCancel={() => setScannerOpen(false)}
        />
      )}

      {/* Единая модалка ошибок */}
      <ErrorModal
        kind={errorKind}
        onRetry={() => {
          setErrorKind(null);
          setScannerOpen(true);
        }}
        onClose={() => setErrorKind(null)}
      />
    </div>
  );
}
