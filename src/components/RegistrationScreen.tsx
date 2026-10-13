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
    <div className="p-4 pt-8">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-block relative">
          <h1 className="text-5xl neon-pink tracking-wider mb-2">
            VK
          </h1>
          <h2 className="text-2xl neon-cyan tracking-widest">
            СЕРВИС
          </h2>
          <div className="absolute -top-3 -right-3 text-yellow-300 text-2xl">★</div>
          <div className="absolute -bottom-2 -left-3 text-yellow-300 text-xl">✦</div>
        </div>
        <p className="text-[#ff00ff] text-sm mt-4 tracking-widest opacity-80">
          ▸ СИСТЕМА БАЛЛОВ ◂
        </p>
      </div>

      {/* QR Code Info Toggle */}
      <div className="card-retro rounded-none p-4 mb-4">
        <button
          onClick={() => setShowQRInfo(!showQRInfo)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm text-[#00ffff] tracking-wider">
            ◆ ДОСТУПНЫЕ ID ◆
          </span>
          <span className="text-[#ff00ff] text-xl">{showQRInfo ? '▼' : '▶'}</span>
        </button>
        
        {showQRInfo && (
          <div className="mt-4 space-y-4 border-t-2 border-[#ff00ff]/30 pt-4">
            <div>
              <p className="text-xs text-[#ffff00] tracking-wider mb-2">▸ УЧАСТНИКИ:</p>
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-black/40 border border-[#00ffff]/30 px-3 py-2 mb-1">
                  <span className="text-xs text-[#00ffff]">{p.fullName}</span>
                  <span className="text-xs font-mono text-[#ffff00] border border-[#ffff00]/50 px-2 py-0.5">{p.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-[#39ff14] tracking-wider mb-2">▸ КУРАТОРЫ:</p>
              {curators.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-black/40 border border-[#39ff14]/30 px-3 py-2 mb-1">
                  <span className="text-xs text-[#39ff14]">{c.fullName}</span>
                  <span className="text-xs font-mono text-[#ffff00] border border-[#ffff00]/50 px-2 py-0.5">{c.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-[#ff3131] tracking-wider mb-2">▸ АДМИН:</p>
              {admins.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-black/40 border border-[#ff3131]/30 px-3 py-2 mb-1">
                  <span className="text-xs text-[#ff3131]">{a.fullName}</span>
                  <span className="text-xs font-mono text-[#ffff00] border border-[#ffff00]/50 px-2 py-0.5">{a.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual ID Input */}
      <div className="card-retro-cyan rounded-none p-4 mb-4">
        <label className="block text-sm text-[#00ffff] tracking-wider mb-3">
          ▸ ВВЕДИТЕ ID ◂
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="P001 / C001 / A001"
            className="input-retro flex-1 px-4 py-3 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="btn-retro btn-retro-pink px-5 py-3 text-sm"
          >
            ВОЙТИ
          </button>
        </div>
      </div>

      {/* Error Modal */}
      {showError && (
        <div className="modal-overlay">
          <div className="card-retro-yellow rounded-none p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">⚠</div>
            <p className="text-[#ffff00] text-sm tracking-wider mb-4">{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-retro btn-retro-yellow px-6 py-2 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="mb-6">
        <p className="text-center text-xs text-[#ff00ff]/60 tracking-widest mb-3">
          ▸ БЫСТРЫЙ ДОСТУП ◂
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onLogin('P001')}
            className="btn-retro bg-[#00ffff] text-black py-4 text-xs tracking-wider"
          >
            УЧАСТНИК
          </button>
          <button
            onClick={() => onLogin('C001')}
            className="btn-retro bg-[#39ff14] text-black py-4 text-xs tracking-wider"
          >
            КУРАТОР
          </button>
          <button
            onClick={() => onLogin('A001')}
            className="btn-retro bg-[#ff3131] text-white py-4 text-xs tracking-wider"
          >
            АДМИН
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card-retro rounded-none p-4">
        <h3 className="text-sm text-[#ff00ff] tracking-wider mb-3">◆ КАК ЭТО РАБОТАЕТ ◆</h3>
        <ul className="text-xs text-[#00ffff] space-y-2 tracking-wide">
          <li>▸ Участники показывают QR-код кураторам</li>
          <li>▸ Кураторы сканируют QR и начисляют/списывают баллы</li>
          <li>▸ Администратор отслеживает рейтинг групп</li>
          <li>▸ Каждый пользователь имеет уникальный ID</li>
        </ul>
      </div>
    </div>
  );
}
