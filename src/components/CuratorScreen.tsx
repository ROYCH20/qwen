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
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanResult(decodedText);
          scanner.stop().catch(() => {});
          setIsScanning(false);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      setShowError('Нет доступа к камере. Используйте ручной ввод ID.');
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
      setShowError(`Недостаточно баллов! У участника только ${scannedUser.points} баллов.`);
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
    <div className="p-4 pt-10">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center soft-glow-mint" style={{ background: 'linear-gradient(135deg, #98fb98, #7fdbca)' }}>
          <span className="text-3xl">✿</span>
        </div>
        <h1 className="text-2xl text-gradient-mint tracking-wider">Куратор</h1>
      </div>

      {/* Curator Header */}
      <div className="card-soft-mint p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #98fb98, #7fdbca)' }}>
            🎓
          </div>
          <div>
            <h2 className="text-base tracking-wide" style={{ color: '#4a3154' }}>{user.fullName}</h2>
            <p className="text-sm tracking-wider" style={{ color: '#5ba37a' }}>ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="card-soft-sky p-4 mb-4">
        <h3 className="text-sm tracking-wider mb-3" style={{ color: '#5ba3c4' }}>✧ Сканирование QR ✧</h3>
        
        {!isScanning ? (
          <div className="space-y-3">
            <button
              onClick={startScanner}
              className="btn-soft btn-soft-sky w-full py-3 text-sm tracking-wider"
            >
              ✿ Открыть камеру
            </button>
            
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200, 162, 200, 0.4), transparent)' }}></div>
              <span className="text-xs tracking-wider" style={{ color: '#c8a2c8' }}>или введите ID</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200, 162, 200, 0.4), transparent)' }}></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="ID участника (P001)"
                className="input-soft flex-1 px-4 py-3 text-sm"
              />
              <button
                onClick={handleManualScan}
                className="btn-soft btn-soft-mint px-4 py-3 text-sm tracking-wider"
              >
                Найти
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div id={scannerContainerId} className="overflow-hidden"></div>
            <button
              onClick={stopScanner}
              className="btn-soft btn-soft-red w-full py-3 text-sm tracking-wider"
            >
              Остановить
            </button>
          </div>
        )}
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

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="card-soft-mint p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #98fb98, #7fdbca)' }}>
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-sm tracking-wide mb-5" style={{ color: '#4a3154' }}>{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-soft btn-soft-mint px-8 py-2.5 text-sm tracking-wider"
            >
              Отлично
            </button>
          </div>
        </div>
      )}

      {/* Scanned User Info */}
      {scannedUser && (
        <div className="card-soft-lavender p-4 mb-4">
          <h3 className="text-sm tracking-wider mb-3" style={{ color: '#b19cd9' }}>✧ Участник найден ✧</h3>
          <div className="rounded-2xl p-3 mb-4" style={{ background: 'rgba(135, 206, 235, 0.15)', border: '1.5px solid rgba(135, 206, 235, 0.3)' }}>
            <p className="text-sm tracking-wide" style={{ color: '#4a3154' }}>{scannedUser.fullName}</p>
            <p className="text-xs tracking-wider" style={{ color: '#5ba3c4' }}>Группа: {scannedUser.group} • ID: {scannedUser.id}</p>
            <p className="text-sm tracking-wider mt-1" style={{ color: '#d4a82f' }}>Баланс: {scannedUser.points} ★</p>
          </div>

          {/* Action Selection */}
          <div className="mb-4">
            <p className="text-xs tracking-wider mb-2" style={{ color: '#b19cd9' }}>Действие:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`py-3 text-sm tracking-wider rounded-2xl transition ${
                  action === 'credit'
                    ? 'btn-soft btn-soft-mint'
                    : 'bg-white/50 text-gray-400 border-2 border-gray-200'
                }`}
              >
                ✿ Зачисление
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`py-3 text-sm tracking-wider rounded-2xl transition ${
                  action === 'debit'
                    ? 'btn-soft btn-soft-red'
                    : 'bg-white/50 text-gray-400 border-2 border-gray-200'
                }`}
              >
                ✿ Списание
              </button>
            </div>
          </div>

          {/* Points Selection */}
          <div className="mb-4">
            <p className="text-xs tracking-wider mb-2" style={{ color: '#b19cd9' }}>Количество баллов:</p>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`py-4 text-lg tracking-wider rounded-2xl transition ${
                    points === p
                      ? 'btn-soft btn-soft-yellow'
                      : 'bg-white/50 border-2 border-gray-200'
                  }`}
                  style={points === p ? {} : { color: '#999' }}
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
              className={`py-3 text-sm tracking-wider rounded-2xl transition ${
                points !== null
                  ? action === 'credit'
                    ? 'btn-soft btn-soft-mint'
                    : 'btn-soft btn-soft-red'
                  : 'bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed'
              }`}
            >
              {action === 'credit' ? `+${points || 0}` : `-${points || 0}`}
            </button>
            <button
              onClick={handleReset}
              className="btn-soft py-3 text-sm tracking-wider bg-white/50 border-2 border-gray-200"
              style={{ color: '#c8a2c8' }}
            >
              Сброс
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
