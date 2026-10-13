import { useState } from 'react';
import { getUserById } from '../database';

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
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome flicker">СИСТЕМА</h1>
        <h2 className="text-chrome-soft fit-flow fit-sub" style={{ marginTop: '4px', letterSpacing: '0.08em', fontWeight: 700 }}>
          БАЛЛОВ
        </h2>
      </div>

      {/* Вход в систему — hud-box */}
      <div className="hud-box">
        <span className="hud-label fit-flow fit-title">ВХОД В СИСТЕМУ</span>
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
            <span className="fit-nowrap fit-btn3">START / ВОЙТИ</span>
          </button>
          <p style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
            Формат ID: буква роли и номер, например: P001
          </p>
        </div>
      </div>

      {/* Быстрый доступ */}
      <div style={{ marginBottom: 'var(--gap-block)' }}>
        <p className="center-col text-neon-lilac fit-flow fit-sub" style={{ marginBottom: '12px', fontWeight: 500 }}>
          Быстрый доступ
        </p>
        <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
          <button onClick={() => onLogin('P001')} className="btn-neon btn-cyan">
            <span className="fit-nowrap fit-btn3">Участник</span>
          </button>
          <button onClick={() => onLogin('C001')} className="btn-neon btn-lilac">
            <span className="fit-nowrap fit-btn3">Куратор</span>
          </button>
          <button onClick={() => onLogin('A001')} className="btn-neon btn-danger">
            <span className="fit-nowrap fit-btn3">Админ</span>
          </button>
        </div>
      </div>

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">Понятно</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
