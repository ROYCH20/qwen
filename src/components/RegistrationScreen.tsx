import { useState } from 'react';
import { getUserById } from '../database';
import FitText from '../FitText';

interface Props {
  onLogin: (userId: string) => void;
}

export default function RegistrationScreen({ onLogin }: Props) {
  const [manualId, setManualId] = useState('');
  const [showError, setShowError] = useState('');

  const handleManualLogin = () => {
    if (!manualId.trim()) {
      setShowError('Введите ID пользователя');
      return;
    }
    const user = getUserById(manualId.trim());
    if (!user) {
      setShowError(`Пользователь с ID "${manualId.trim()}" не существует в системе!`);
      return;
    }
    setShowError('');
    onLogin(user.id);
  };

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome flicker">
          <FitText lines={1} max={28} min={14}>СИСТЕМА</FitText>
        </h1>
        <h2 className="text-chrome-soft" style={{ fontSize: 'clamp(16px, 5vw, 22px)', letterSpacing: '0.08em', lineHeight: 1.2, fontWeight: 700 }}>
          <FitText lines={1} max={22} min={14}>БАЛЛОВ</FitText>
        </h2>
      </div>

      {/* Вход в систему — hud-box */}
      <div className="hud-box">
        <span className="hud-label">Вход в систему</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="Например: P001"
            className="input-neon"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="btn-neon btn-chrome"
          >
            <FitText lines={1} max={15} min={10}>START / ВОЙТИ</FitText>
          </button>
          <p style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
            Формат ID: буква роли и номер, например: P001
          </p>
        </div>
      </div>

      {/* Быстрый доступ */}
      <div style={{ marginBottom: 'var(--gap-block)' }}>
        <p className="center-col text-neon-lilac screen-subtitle" style={{ marginBottom: '12px' }}>
          <FitText lines={1} max={15} min={10}>Быстрый доступ</FitText>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
          <button onClick={() => onLogin('P001')} className="btn-neon btn-cyan btn-grid" style={{ paddingInline: 'clamp(8px, 2.5vw, 14px)' }}>
            <FitText lines={1} max={14} min={8}>Участник</FitText>
          </button>
          <button onClick={() => onLogin('C001')} className="btn-neon btn-lilac btn-grid" style={{ paddingInline: 'clamp(8px, 2.5vw, 14px)' }}>
            <FitText lines={1} max={14} min={8}>Куратор</FitText>
          </button>
          <button onClick={() => onLogin('A001')} className="btn-neon btn-danger btn-grid" style={{ paddingInline: 'clamp(8px, 2.5vw, 14px)' }}>
            <FitText lines={1} max={14} min={8}>Админ</FitText>
          </button>
        </div>
      </div>

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center text-wrap-balance" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <FitText lines={1} max={15} min={10}>Понятно</FitText>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
