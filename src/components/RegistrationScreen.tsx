import { useState } from 'react';
import { getUserById } from '../database';
import { LogIn } from 'lucide-react';

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
        <h1 className="screen-title chrome-serif">СИСТЕМА</h1>
        <h2 className="chrome-serif" style={{ fontSize: 'clamp(16px, 5vw, 22px)', letterSpacing: '0.08em', fontWeight: 700, marginTop: '4px' }}>
          БАЛЛОВ
        </h2>
      </div>

      {/* Вход в систему — таро-рамка */}
      <div className="hud-box">
        <span className="star-tl">✦</span>
        <span className="star-tr">✦</span>
        <span className="star-bl">✦</span>
        <span className="star-br">✦</span>
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
          <p style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.3 }}>
            Формат ID: буква роли и номер, например: P001
          </p>
          <button
            onClick={handleManualLogin}
            className="btn-neon btn-chrome"
          >
            <LogIn size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
            <span className="fit-nowrap fit-btn3">START / ВОЙТИ</span>
          </button>
        </div>
      </div>

      {/* Быстрый доступ — глянец-сквирклы */}
      <div style={{ marginBottom: 'var(--gap-block)' }}>
        <p className="center-col fit-flow fit-sub" style={{ marginBottom: '12px', fontWeight: 500, color: 'var(--muted)' }}>
          Быстрый доступ
        </p>
        <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
          <button onClick={() => onLogin('P001')} className="btn-neon btn-lilac">
            <span className="fit-nowrap fit-btn3">Участник</span>
          </button>
          <button onClick={() => onLogin('C001')} className="btn-neon btn-lilac">
            <span className="fit-nowrap fit-btn3">Куратор</span>
          </button>
          <button onClick={() => onLogin('A001')} className="btn-neon btn-lilac">
            <span className="fit-nowrap fit-btn3">Админ</span>
          </button>
        </div>
      </div>

      {/* Модальное окно ошибки — таро-рамка */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', color: 'var(--text)' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">ПОНЯТНО</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
