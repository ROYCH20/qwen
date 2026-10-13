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
      {/* Title - без VK Сервис */}
      <div className="center-content mb-8">
        <div className="icon-circle glow-violet mb-4" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6b21a8)' }}>
          <span className="text-white">✦</span>
        </div>
        <h1 className="text-3xl text-gradient-violet tracking-wider mb-2 font-bold">
          Система баллов
        </h1>
        <p className="text-base text-violet-medium tracking-wide">
          Вход в аккаунт
        </p>
      </div>

      {/* QR Code Info Toggle */}
      <div className="card-violet-accent p-5 mb-4">
        <button
          onClick={() => setShowQRInfo(!showQRInfo)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-base text-violet-primary font-semibold tracking-wide">
            ✧ Доступные ID пользователей
          </span>
          <span className="text-2xl text-violet-light">{showQRInfo ? '▾' : '▸'}</span>
        </button>
        
        {showQRInfo && (
          <div className="mt-4 space-y-4 pt-4" style={{ borderTop: '1.5px solid #c4b5fd' }}>
            <div>
              <p className="text-sm text-violet-primary font-semibold tracking-wider mb-3">✦ Участники:</p>
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 mb-2">
                  <span className="text-sm text-violet-dark font-medium">{p.fullName}</span>
                  <span className="text-sm font-mono px-3 py-1 rounded-full badge-violet">{p.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm text-violet-primary font-semibold tracking-wider mb-3">✦ Кураторы:</p>
              {curators.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 mb-2">
                  <span className="text-sm text-violet-dark font-medium">{c.fullName}</span>
                  <span className="text-sm font-mono px-3 py-1 rounded-full badge-violet">{c.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm text-violet-primary font-semibold tracking-wider mb-3">✦ Админ:</p>
              {admins.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 mb-2">
                  <span className="text-sm text-violet-dark font-medium">{a.fullName}</span>
                  <span className="text-sm font-mono px-3 py-1 rounded-full badge-violet">{a.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual ID Input */}
      <div className="card-violet p-5 mb-4">
        <label className="block text-base text-violet-primary font-semibold tracking-wide mb-3">
          ✧ Введите ID пользователя
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="Например: P001"
            className="input-violet flex-1 px-4 py-3.5 text-base"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="btn-violet btn-violet-primary px-6 py-3.5 text-base tracking-wider"
          >
            Войти
          </button>
        </div>
      </div>

      {/* Error Modal */}
      {showError && (
        <div className="modal-overlay">
          <div className="card-violet p-6 w-full max-w-sm center-content">
            <div className="icon-circle mb-4" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
              <span>⚠</span>
            </div>
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
          ✧ Быстрый доступ ✧
        </p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onLogin('P001')}
            className="btn-violet btn-violet-primary py-4 text-sm tracking-wider"
          >
            ✦ Участник
          </button>
          <button
            onClick={() => onLogin('C001')}
            className="btn-violet btn-violet-success py-4 text-sm tracking-wider"
          >
            ✦ Куратор
          </button>
          <button
            onClick={() => onLogin('A001')}
            className="btn-violet btn-violet-danger py-4 text-sm tracking-wider"
          >
            ✦ Админ
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card-violet p-5">
        <h3 className="text-base text-violet-primary font-semibold tracking-wider mb-4 center-content">✧ Как это работает ✧</h3>
        <ul className="text-sm text-violet-dark space-y-3 tracking-wide">
          <li className="flex items-start gap-3">
            <span className="text-violet-light text-lg">✦</span>
            <span className="font-medium">Участники показывают QR-код кураторам</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-violet-light text-lg">✦</span>
            <span className="font-medium">Кураторы сканируют QR и начисляют/списывают баллы</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-violet-light text-lg">✦</span>
            <span className="font-medium">Администратор отслеживает рейтинг групп</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-violet-light text-lg">✦</span>
            <span className="font-medium">Каждый пользователь имеет уникальный ID</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
