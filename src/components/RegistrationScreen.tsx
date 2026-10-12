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
    <div className="p-4">
      {/* Welcome Section */}
      <div className="text-center mb-6 mt-4">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0077ff] to-[#0055cc] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.188 1.368 1.259 2.184 1.814.616.42 1.084.328 1.084.328l2.178-.03s1.14-.07.6-.964c-.044-.073-.314-.661-1.618-1.869-1.366-1.265-1.183-1.06.462-3.246.998-1.33 1.398-2.142 1.273-2.489-.12-.331-.856-.244-.856-.244l-2.45.015s-.182-.025-.316.056c-.132.079-.216.263-.216.263s-.388 1.032-.906 1.91c-1.094 1.856-1.531 1.953-1.71 1.838-.416-.268-.312-1.075-.312-1.65 0-1.79.272-2.542-.53-2.736-.266-.064-.462-.107-1.142-.114-.872-.009-1.61.003-2.028.208-.278.136-.492.44-.362.457.162.022.528.099.722.363.25.341.241 1.107.241 1.107s.144 2.11-.336 2.372c-.33.18-.782-.188-1.75-1.87-.496-.862-.87-1.814-.87-1.814s-.072-.176-.2-.27c-.156-.114-.374-.15-.374-.15l-2.328.015s-.35.01-.478.162c-.114.135-.01.414-.01.414s1.827 4.272 3.894 6.426c1.894 1.976 4.044 1.849 4.044 1.849h.974z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">VK Сервис баллов</h1>
        <p className="text-gray-500 text-sm">Войдите через QR-код или введите ID</p>
      </div>

      {/* QR Code Info */}
      <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-4">
        <button
          onClick={() => setShowQRInfo(!showQRInfo)}
          className="w-full flex items-center justify-between"
        >
          <span className="text-sm font-medium text-gray-700">📋 Доступные QR-коды для входа</span>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showQRInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showQRInfo && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-[#0077ff] mb-1">👤 Участники:</p>
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 mb-1">
                  <span className="text-xs text-gray-600">{p.fullName}</span>
                  <span className="text-xs font-mono bg-blue-50 text-[#0077ff] px-2 py-0.5 rounded">{p.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1">🎓 Кураторы:</p>
              {curators.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 mb-1">
                  <span className="text-xs text-gray-600">{c.fullName}</span>
                  <span className="text-xs font-mono bg-green-50 text-green-600 px-2 py-0.5 rounded">{c.id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">👑 Админ:</p>
              {admins.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 mb-1">
                  <span className="text-xs text-gray-600">{a.fullName}</span>
                  <span className="text-xs font-mono bg-red-50 text-red-600 px-2 py-0.5 rounded">{a.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual ID Input */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔑 Введите ID пользователя (имитация сканирования QR)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value); setShowError(''); }}
            placeholder="Например: P001, C001, A001"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0077ff] focus:ring-2 focus:ring-[#0077ff]/20"
            onKeyDown={(e) => e.key === 'Enter' && handleManualLogin()}
          />
          <button
            onClick={handleManualLogin}
            className="bg-[#0077ff] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#0066dd] transition active:scale-95"
          >
            Войти
          </button>
        </div>
        {showError && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-red-600 text-xs">{showError}</p>
          </div>
        )}
      </div>

      {/* Quick Access Buttons */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 text-center mb-2">Быстрый доступ (демо)</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onLogin('P001')}
            className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl py-3 text-xs font-medium hover:bg-blue-100 transition active:scale-95"
          >
            👤 Участник
          </button>
          <button
            onClick={() => onLogin('C001')}
            className="bg-green-50 border border-green-200 text-green-700 rounded-xl py-3 text-xs font-medium hover:bg-green-100 transition active:scale-95"
          >
            🎓 Куратор
          </button>
          <button
            onClick={() => onLogin('A001')}
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl py-3 text-xs font-medium hover:bg-red-100 transition active:scale-95"
          >
            👑 Админ
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-r from-[#0077ff]/5 to-[#0077ff]/10 rounded-2xl p-4 border border-[#0077ff]/20">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">ℹ️ Как это работает?</h3>
        <ul className="text-xs text-gray-600 space-y-1.5">
          <li>• Участники показывают QR-код кураторам</li>
          <li>• Кураторы сканируют QR и начисляют/списывают баллы</li>
          <li>• Администратор отслеживает рейтинг групп</li>
          <li>• Каждый пользователь имеет уникальный ID</li>
        </ul>
      </div>
    </div>
  );
}
