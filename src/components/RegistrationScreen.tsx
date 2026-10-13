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
    <div className="p-4 pt-10">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-block relative">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center soft-glow-pink" style={{ background: 'linear-gradient(135deg, #ffb6c1, #ff9ecd)' }}>
            <span className="text-4xl">✿</span>
          </div>
          <h1 className="text-4xl text-gradient-pink tracking-wider mb-1">
            VK
          </h1>
          <h2 className="text-xl text-gradient-lavender tracking-widest">
            Сервис
          </h2>
        </div>
        <p className="text-sm mt-4 tracking-wide" style={{ color: '#c8a2c8' }}>
          ♡ Система баллов ♡
        </p>
      </div>

      {/* QR Code Info Toggle */}
      <div className="card-soft-lavender p-4 mb-4">
        <button
          onClick={() => setShowQRInfo(!showQRInfo)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm tracking-wide" style={{ color: '#b19cd9' }}>
            ✧ Доступные ID
          </span>
          <span className="text-xl" style={{ color: '#c8a2c8' }}>{showQRInfo ? '▾' : '▸'}</span>
        </button>
        
        {showQRInfo && (
          <div className="mt-4 space-y-4 pt-4" style={{ borderTop: '1px solid rgba(200, 162, 200, 0.3)' }}>
            <div>
              <p className="text-xs tracking-wider mb-2" style={{ color: '#87ceeb' }}>✿ Участники:</p>
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-white/60 rounded-2xl px-3 py-2 mb-1.5">
                  <span className="text-xs" style={{ color: '#4a3154' }}>{p.fullName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(135, 206, 235, 0.2)', color: '#5ba3c4' }}>{p.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs tracking-wider mb-2" style={{ color: '#98fb98' }}>✿ Кураторы:</p>
              {curators.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-white/60 rounded-2xl px-3 py-2 mb-1.5">
                  <span className="text-xs" style={{ color: '#4a3154' }}>{c.fullName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(152, 251, 152, 0.2)', color: '#5ba37a' }}>{c.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs tracking-wider mb-2" style={{ color: '#ff9999' }}>✿ Админ:</p>
              {admins.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-white/60 rounded-2xl px-3 py-2 mb-1.5">
                  <span className="text-xs" style={{ color: '#4a3154' }}>{a.fullName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(255, 153, 153, 0.2)', color: '#c45b5b' }}>{a.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual ID Input */}
      <div className="card-soft-sky p-4 mb-4">
        <label className="block text-sm tracking-wide mb-3" style={{ color: '#5ba3c4' }}>
          ✧ Введите ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="P001 / C001 / A001"
            className="input-soft flex-1 px-4 py-3 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="btn-soft btn-soft-pink px-5 py-3 text-sm tracking-wider"
          >
            Войти
          </button>
        </div>
      </div>

      {/* Error Modal */}
      {showError && (
        <div className="modal-overlay">
          <div className="card-soft-yellow p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffeb99, #ffd966)' }}>
              <span className="text-3xl">⚠</span>
            </div>
            <p className="text-sm tracking-wide mb-5" style={{ color: '#4a3154' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-soft btn-soft-yellow px-8 py-2.5 text-sm tracking-wider"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="mb-6">
        <p className="text-center text-xs tracking-wider mb-3" style={{ color: '#c8a2c8' }}>
          ✧ Быстрый доступ ✧
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onLogin('P001')}
            className="btn-soft btn-soft-sky py-4 text-xs tracking-wider"
          >
            ✿ Участник
          </button>
          <button
            onClick={() => onLogin('C001')}
            className="btn-soft btn-soft-mint py-4 text-xs tracking-wider"
          >
            ✿ Куратор
          </button>
          <button
            onClick={() => onLogin('A001')}
            className="btn-soft btn-soft-red py-4 text-xs tracking-wider"
          >
            ✿ Админ
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card-soft p-4">
        <h3 className="text-sm tracking-wider mb-3" style={{ color: '#ff9ecd' }}>✧ Как это работает ✧</h3>
        <ul className="text-xs space-y-2 tracking-wide" style={{ color: '#6b4d7a' }}>
          <li className="flex items-start gap-2">
            <span style={{ color: '#ffb6c1' }}>✿</span>
            <span>Участники показывают QR-код кураторам</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#98fb98' }}>✿</span>
            <span>Кураторы сканируют QR и начисляют/списывают баллы</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#ffeb99' }}>✿</span>
            <span>Администратор отслеживает рейтинг групп</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#87ceeb' }}>✿</span>
            <span>Каждый пользователь имеет уникальный ID</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
