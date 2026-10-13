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
    <div className="p-4 pt-12">
      {/* Title */}
      <div className="center-content mb-8">
        <h1 className="text-2xl text-gradient-violet tracking-wider mb-2 font-bold text-center">
          Система баллов
        </h1>
        <p className="text-sm text-violet-medium tracking-wide text-center">
          Вход в аккаунт
        </p>
      </div>

      {/* QR Code Info Toggle */}
      <div className="card-violet-accent p-4 mb-4">
        <button
          onClick={() => setShowQRInfo(!showQRInfo)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm text-violet-primary font-semibold tracking-wide">
            Доступные ID пользователей
          </span>
          <span className="text-2xl text-violet-light">{showQRInfo ? '▾' : '▸'}</span>
        </button>
        
        {showQRInfo && (
          <div className="mt-3 space-y-3 pt-3" style={{ borderTop: '1.5px solid #c4b5fd' }}>
            <div>
              <p className="text-xs text-violet-primary font-semibold tracking-wider mb-2">Участники:</p>
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-white rounded-xl px-3 py-2 mb-1.5 gap-2">
                  <span className="text-xs text-violet-dark font-medium truncate flex-1">{p.fullName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full badge-violet flex-shrink-0">{p.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-violet-primary font-semibold tracking-wider mb-2">Кураторы:</p>
              {curators.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-white rounded-xl px-3 py-2 mb-1.5 gap-2">
                  <span className="text-xs text-violet-dark font-medium truncate flex-1">{c.fullName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full badge-violet flex-shrink-0">{c.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-violet-primary font-semibold tracking-wider mb-2">Админ:</p>
              {admins.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-white rounded-xl px-3 py-2 mb-1.5 gap-2">
                  <span className="text-xs text-violet-dark font-medium truncate flex-1">{a.fullName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full badge-violet flex-shrink-0">{a.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual ID Input */}
      <div className="card-violet p-4 mb-4">
        <label className="block text-sm text-violet-primary font-semibold tracking-wide mb-2 text-center">
          Введите ID пользователя
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="Например: P001"
            className="input-violet flex-1 px-3 py-3 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="btn-violet btn-violet-primary px-4 py-3 text-sm tracking-wider"
          >
            Войти
          </button>
        </div>
      </div>

      {/* Error Modal */}
      {showError && (
        <div className="modal-overlay">
          <div className="card-violet p-6 w-full max-w-sm center-content">
            <p className="text-base text-violet-dark tracking-wide mb-6 font-medium">{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-violet btn-violet-warning px-8 py-3 text-base tracking-wider"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="mb-6">
        <p className="center-content text-sm text-violet-muted tracking-wider mb-4 font-medium">
          Быстрый доступ
        </p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onLogin('P001')}
            className="btn-violet btn-violet-primary py-4 text-sm tracking-wider"
          >
            Участник
          </button>
          <button
            onClick={() => onLogin('C001')}
            className="btn-violet btn-violet-success py-4 text-sm tracking-wider"
          >
            Куратор
          </button>
          <button
            onClick={() => onLogin('A001')}
            className="btn-violet btn-violet-danger py-4 text-sm tracking-wider"
          >
            Админ
          </button>
        </div>
      </div>


    </div>
  );
}
