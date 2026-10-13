import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getUserById, updatePoints, User } from '../database';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function CuratorScreen({ user, onLogout }: Props) {
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
      <div className="center-content mb-6">
        <h1 className="text-2xl text-gradient-violet tracking-wider font-bold">Панель куратора</h1>
      </div>

      {/* Curator Header */}
      <div className="card-violet p-4 mb-4 text-center">
        <div>
          <h2 className="text-sm text-violet-dark font-semibold tracking-wide">{user.fullName}</h2>
          <p className="text-xs text-violet-muted tracking-wider font-medium">ID: {user.id}</p>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="card-violet-accent p-4 mb-4">
        <h3 className="text-sm text-violet-primary font-semibold tracking-wider mb-3 text-center">Сканирование QR-кода</h3>
        
        {!isScanning ? (
          <div className="space-y-3">
            <button
              onClick={startScanner}
              className="btn-violet btn-violet-primary w-full py-3 text-sm tracking-wider"
            >
              Открыть камеру
            </button>
            
            <div className="flex items-center gap-2 py-1">
              <div className="flex-1 soft-divider"></div>
              <span className="text-xs text-violet-muted tracking-wider font-medium">или введите ID</span>
              <div className="flex-1 soft-divider"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="ID участника (P001)"
                className="input-violet flex-1 px-3 py-3 text-sm"
              />
              <button
                onClick={handleManualScan}
                className="btn-violet btn-violet-success px-4 py-3 text-sm tracking-wider"
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
              className="btn-violet btn-violet-danger w-full py-3 text-sm tracking-wider"
            >
              Остановить сканирование
            </button>
          </div>
        )}
      </div>

      {/* Error Modal */}
      {showError && (
        <div className="modal-overlay">
          <div className="card-violet p-6 w-full max-w-sm center-content">
            <p className="text-base text-violet-dark tracking-wide mb-6 font-medium text-center">{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-violet btn-violet-warning px-8 py-3 text-base tracking-wider"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="card-violet p-6 w-full max-w-sm center-content">
            <p className="text-base text-violet-dark tracking-wide mb-6 font-medium text-center">{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-violet btn-violet-success px-8 py-3 text-base tracking-wider"
            >
              Отлично
            </button>
          </div>
        </div>
      )}

      {/* Scanned User Info */}
      {scannedUser && (
        <div className="card-violet p-4 mb-4">
          <h3 className="text-sm text-violet-primary font-semibold tracking-wider mb-3 text-center">Участник найден</h3>
          <div className="rounded-2xl p-3 mb-4 text-center" style={{ background: '#ede9fe', border: '1.5px solid #c4b5fd' }}>
            <p className="text-sm text-violet-dark font-semibold tracking-wide mb-1 truncate">{scannedUser.fullName}</p>
            <p className="text-xs text-violet-muted tracking-wider font-medium">Группа: {scannedUser.group} • ID: {scannedUser.id}</p>
            <p className="text-sm text-violet-primary tracking-wider mt-2 font-bold">Баланс: {scannedUser.points}</p>
          </div>

          {/* Action Selection */}
          <div className="mb-4">
            <p className="text-xs text-violet-primary font-semibold tracking-wider mb-2 text-center">Действие:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`py-3 text-sm tracking-wider rounded-2xl transition font-semibold ${
                  action === 'credit'
                    ? 'btn-violet btn-violet-success'
                    : 'btn-violet btn-violet-light'
                }`}
              >
                Зачисление
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`py-3 text-sm tracking-wider rounded-2xl transition font-semibold ${
                  action === 'debit'
                    ? 'btn-violet btn-violet-danger'
                    : 'btn-violet btn-violet-light'
                }`}
              >
                Списание
              </button>
            </div>
          </div>

          {/* Points Selection */}
          <div className="mb-4">
            <p className="text-xs text-violet-primary font-semibold tracking-wider mb-2 text-center">Количество баллов:</p>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`py-4 text-lg tracking-wider rounded-2xl transition font-bold ${
                    points === p
                      ? 'btn-violet btn-violet-warning'
                      : 'btn-violet btn-violet-light'
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
              className={`py-3 text-sm tracking-wider rounded-2xl transition font-bold ${
                points !== null
                  ? action === 'credit'
                    ? 'btn-violet btn-violet-success'
                    : 'btn-violet btn-violet-danger'
                  : 'btn-violet btn-violet-light opacity-50 cursor-not-allowed'
              }`}
            >
              {action === 'credit' ? `+${points || 0}` : `-${points || 0}`}
            </button>
            <button
              onClick={handleReset}
              className="btn-violet btn-violet-secondary py-3 text-sm tracking-wider font-semibold"
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="btn-violet btn-violet-dark w-full py-4 text-base tracking-wider shadow-lg mt-6 mb-4 font-semibold"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
