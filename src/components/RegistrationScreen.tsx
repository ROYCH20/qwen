import { useState } from 'react';
import { getUserById, getUsersByRole } from '../database';

interface Props {
  onLogin: (userId: string) => void;
}

export default function RegistrationScreen({ onLogin }: Props) {
  const [manualId, setManualId] = useState('');
  const [showError, setShowError] = useState('');
  const [showQRInfo, setShowQRInfo] = useState(false);

  const participants = getUsersByRole('participant');
  const curators = getUsersByRole('curator');
  const admins = getUsersByRole('admin');

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
    <div className="pt-8">
      {/* Заголовок с хром-эффектом */}
      <div className="center-col mb-8">
        <h1 className="text-4xl text-chrome tracking-wider mb-2 font-bold flicker">
          СИСТЕМА
        </h1>
        <h2 className="text-2xl text-chrome-soft tracking-widest font-bold">
          БАЛЛОВ
        </h2>
      </div>

      {/* Раскрывающийся список ID */}
      <div className="glass-panel-strong mb-4 relative">
        <button
          onClick={() => setShowQRInfo(!showQRInfo)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm text-neon-pink font-semibold tracking-wide">
            Доступные ID пользователей
          </span>
          <span className="text-xl text-neon-cyan">{showQRInfo ? '▾' : '▸'}</span>
        </button>
        
        {showQRInfo && (
          <div className="mt-4 space-y-3 pt-3 neon-divider">
            <div>
              <p className="text-xs text-neon-cyan font-semibold tracking-wider mb-2">Участники:</p>
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-black/20 rounded-2xl px-3 py-2 mb-1.5 gap-2">
                  <span className="text-xs text-white/90 font-medium truncate flex-1">{p.fullName}</span>
                  <span className="badge-chrome text-xs flex-shrink-0">{p.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-neon-cyan font-semibold tracking-wider mb-2">Кураторы:</p>
              {curators.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-black/20 rounded-2xl px-3 py-2 mb-1.5 gap-2">
                  <span className="text-xs text-white/90 font-medium truncate flex-1">{c.fullName}</span>
                  <span className="badge-chrome text-xs flex-shrink-0">{c.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-neon-cyan font-semibold tracking-wider mb-2">Админ:</p>
              {admins.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-black/20 rounded-2xl px-3 py-2 mb-1.5 gap-2">
                  <span className="text-xs text-white/90 font-medium truncate flex-1">{a.fullName}</span>
                  <span className="badge-chrome text-xs flex-shrink-0">{a.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Поле ввода ID */}
      <div className="glass-panel mb-4 relative">
        <label className="block text-sm text-neon-lilac font-semibold tracking-wide mb-3 text-center">
          Введите ID пользователя
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="Например: P001"
            className="input-neon flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="btn-neon btn-chrome px-5 text-sm tracking-wider"
          >
            START
          </button>
        </div>
      </div>

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-base text-white tracking-wide mb-6 font-medium text-center">{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink px-8 text-sm tracking-wider"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Быстрый доступ */}
      <div className="mb-6">
        <p className="center-col text-xs text-neon-lilac tracking-wider mb-3 font-medium">
          Быстрый доступ
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onLogin('P001')}
            className="btn-neon btn-cyan text-xs tracking-wider"
          >
            Участник
          </button>
          <button
            onClick={() => onLogin('C001')}
            className="btn-neon btn-lilac text-xs tracking-wider"
          >
            Куратор
          </button>
          <button
            onClick={() => onLogin('A001')}
            className="btn-neon btn-danger text-xs tracking-wider"
          >
            Админ
          </button>
        </div>
      </div>
    </div>
  );
}
