import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getUserById, updatePoints, User } from '../database';

interface Props {
  user: User;
}

export default function CuratorScreen({ user }: Props) {
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'credit' | 'debit'>('credit');
  const [points, setPoints] = useState<number | null>(null);
  const [showError, setShowError] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualScan, setManualScan] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-container';

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setShowError('');
    setScannedUser(null);
    
    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanResult(decodedText);
          scanner.stop().catch(() => {});
          setIsScanning(false);
        },
        () => {} // ignore errors during scanning
      );
    } catch (err) {
      console.error('Camera error:', err);
      setShowError('Не удалось получить доступ к камере. Используйте ручной ввод ID.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setIsScanning(false);
  };

  const handleScanResult = (data: string) => {
    setShowError('');
    setShowSuccess('');
    setScannedUser(null);
    setPoints(null);

    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type !== 'participant_qr') {
        setShowError('Данный QR-код неверный! QR-код должен принадлежать участнику.');
        return;
      }

      const foundUser = getUserById(parsed.userId);
      if (!foundUser) {
        setShowError(`Пользователь с ID "${parsed.userId}" не найден в системе!`);
        return;
      }

      if (foundUser.role !== 'participant') {
        setShowError('Данный QR-код неверный! Данный QR-код не принадлежит участнику.');
        return;
      }

      setScannedUser(foundUser);
    } catch {
      // Если не JSON, пробуем как простой ID
      const foundUser = getUserById(data.trim());
      if (!foundUser) {
        setShowError(`Пользователь с ID "${data.trim()}" не найден в системе!`);
        return;
      }
      if (foundUser.role !== 'participant') {
        setShowError('Данный QR-код неверный! Данный QR-код не принадлежит участнику.');
        return;
      }
      setScannedUser(foundUser);
    }
  };

  const handleManualScan = () => {
    if (!manualScan.trim()) {
      setShowError('Введите ID участника');
      return;
    }
    handleScanResult(manualScan.trim());
  };

  const handleSubmit = () => {
    if (!scannedUser || points === null) {
      setShowError('Выберите количество баллов');
      return;
    }

    if (action === 'debit' && scannedUser.points < points) {
      setShowError(`Недостаточно баллов на счету участника! У участника только ${scannedUser.points} баллов.`);
      return;
    }

    const newPoints = action === 'credit' 
      ? scannedUser.points + points 
      : scannedUser.points - points;

    const success = updatePoints(scannedUser.id, newPoints);
    if (success) {
      setShowSuccess(
        `${action === 'credit' ? 'Зачислено' : 'Списано'} ${points} баллов. Новый баланс: ${newPoints}`
      );
      setShowError('');
      setScannedUser({ ...scannedUser, points: newPoints });
      setPoints(null);
    } else {
      setShowError('Ошибка при обновлении баллов');
    }
  };

  const handleReset = () => {
    setScannedUser(null);
    setPoints(null);
    setShowError('');
    setShowSuccess('');
    setManualScan('');
  };

  return (
    <div className="p-4">
      {/* Curator Header */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-4 mb-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
            🎓
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.fullName}</h2>
            <p className="text-white/80 text-sm">Куратор • ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📷 Сканирование QR-кода участника</h3>
        
        {!isScanning ? (
          <div className="space-y-3">
            <button
              onClick={startScanner}
              className="w-full bg-[#0077ff] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#0066dd] transition active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Открыть камеру для сканирования
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">или введите ID вручную</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="ID участника (напр. P001)"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0077ff] focus:ring-2 focus:ring-[#0077ff]/20"
              />
              <button
                onClick={handleManualScan}
                className="bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-600 transition active:scale-95"
              >
                Найти
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div id={scannerContainerId} className="rounded-xl overflow-hidden border-2 border-gray-200"></div>
            <button
              onClick={stopScanner}
              className="w-full bg-red-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-red-600 transition"
            >
              Остановить сканирование
            </button>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-2">
          <span className="text-red-500 text-lg">❌</span>
          <p className="text-red-600 text-sm">{showError}</p>
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-start gap-2">
          <span className="text-green-500 text-lg">✅</span>
          <p className="text-green-600 text-sm">{showSuccess}</p>
        </div>
      )}

      {/* Scanned User Info */}
      {scannedUser && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 Найденный участник</h3>
          <div className="bg-blue-50 rounded-xl p-3 mb-4">
            <p className="text-sm font-bold text-gray-800">{scannedUser.fullName}</p>
            <p className="text-xs text-gray-500">Группа: {scannedUser.group} • ID: {scannedUser.id}</p>
            <p className="text-sm font-semibold text-[#0077ff] mt-1">Баланс: {scannedUser.points} баллов</p>
          </div>

          {/* Action Selection */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Действие:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`py-3 rounded-xl text-sm font-medium transition ${
                  action === 'credit'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✅ Зачисление
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`py-3 rounded-xl text-sm font-medium transition ${
                  action === 'debit'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ❌ Списание
              </button>
            </div>
          </div>

          {/* Points Selection */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Количество баллов:</p>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`py-3 rounded-xl text-sm font-bold transition ${
                    points === p
                      ? 'bg-[#0077ff] text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSubmit}
              disabled={points === null}
              className={`py-3 rounded-xl text-sm font-bold transition ${
                points !== null
                  ? action === 'credit'
                    ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                    : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {action === 'credit' ? `+${points || 0} баллов` : `-${points || 0} баллов`}
            </button>
            <button
              onClick={handleReset}
              className="py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition active:scale-95"
            >
              Сброс
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
