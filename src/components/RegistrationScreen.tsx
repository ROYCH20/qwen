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
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome flicker">СИСТЕМА</h1>
        <h2 className="text-chrome-soft" style={{ fontSize: 'clamp(16px, 5vw, 22px)', letterSpacing: '0.08em', lineHeight: 1.2, fontWeight: 700 }}>БАЛЛОВ</h2>
      </div>

      {/* Вход в систему — hud-box */}
      <div className="hud-box">
        <span className="hud-label">Вход в систему</span>
        <div className="flex items-stretch" style={{ gap: '10px' }}>
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="Например: P001"
            className="input-neon flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="btn-neon btn-chrome"
            style={{ width: 'auto', paddingInline: '18px', flexShrink: 0 }}
          >
            START
          </button>
        </div>
      </div>

      {/* Быстрый доступ */}
      <div style={{ marginBottom: 'var(--gap-block)' }}>
        <p className="center-col text-neon-lilac screen-subtitle" style={{ marginBottom: '12px' }}>Быстрый доступ</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
          <button onClick={() => onLogin('P001')} className="btn-neon btn-cyan btn-grid">Участник</button>
          <button onClick={() => onLogin('C001')} className="btn-neon btn-lilac btn-grid">Куратор</button>
          <button onClick={() => onLogin('A001')} className="btn-neon btn-danger btn-grid">Админ</button>
        </div>
      </div>

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', lineHeight: 1.3 }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
