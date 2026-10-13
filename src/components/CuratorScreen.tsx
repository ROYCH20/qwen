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
    <div className="pt-8">
      {/* Заголовок */}
      <div className="center-col mb-6">
        <h1 className="text-2xl text-chrome tracking-wider font-bold">КУРАТОР</h1>
        <p className="text-sm text-neon-cyan tracking-wider mt-1">Панель управления</p>
      </div>

      {/* Карточка куратора */}
      <div className="glass-panel mb-4 text-center relative">
        <h2 className="text-sm text-white font-semibold tracking-wide truncate">{user.fullName}</h2>
        <p className="text-xs text-neon-lilac tracking-wider font-medium mt-1">ID: {user.id}</p>
      </div>

      {/* Сканирование */}
      <div className="glass-panel-strong mb-4 relative">
        <h3 className="text-sm text-neon-pink font-semibold tracking-wider mb-3 text-center">Сканирование QR-кода</h3>
        
        {!isScanning ? (
          <div className="space-y-3">
            <button
              onClick={startScanner}
              className="btn-neon btn-cyan w-full text-sm tracking-wider"
            >
              Открыть камеру
            </button>
            
            <div className="flex items-center gap-2 py-1">
              <div className="flex-1 neon-divider"></div>
              <span className="text-xs text-neon-lilac tracking-wider font-medium">или введите ID</span>
              <div className="flex-1 neon-divider"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="ID участника (P001)"
                className="input-neon flex-1 text-sm"
              />
              <button
                onClick={handleManualScan}
                className="btn-neon btn-lilac px-4 text-sm tracking-wider"
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
              className="btn-neon btn-danger w-full text-sm tracking-wider"
            >
              Остановить сканирование
            </button>
          </div>
        )}
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

      {/* Модальное окно успеха */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-base text-white tracking-wide mb-6 font-medium text-center">{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-neon btn-cyan px-8 text-sm tracking-wider"
            >
              Отлично
            </button>
          </div>
        </div>
      )}

      {/* Информация о найденном участнике */}
      {scannedUser && (
        <div className="glass-panel mb-4 relative">
          <h3 className="text-sm text-neon-pink font-semibold tracking-wider mb-3 text-center">Участник найден</h3>
          <div className="rounded-2xl p-3 mb-4 text-center" style={{ background: 'rgba(108, 99, 201, 0.2)', border: '1.5px solid rgba(142, 134, 228, 0.4)' }}>
            <p className="text-sm text-white font-semibold tracking-wide mb-1 truncate">{scannedUser.fullName}</p>
            <p className="text-xs text-neon-lilac tracking-wider font-medium">Группа: {scannedUser.group} • ID: {scannedUser.id}</p>
            <p className="text-sm text-neon-cyan tracking-wider mt-2 font-bold">Баланс: {scannedUser.points}</p>
          </div>

          {/* Выбор действия */}
          <div className="mb-4">
            <p className="text-xs text-neon-lilac font-semibold tracking-wider mb-2 text-center">Действие:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`btn-neon text-sm tracking-wider ${
                  action === 'credit' ? 'btn-cyan' : 'btn-ghost'
                }`}
              >
                Зачисление
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`btn-neon text-sm tracking-wider ${
                  action === 'debit' ? 'btn-danger' : 'btn-ghost'
                }`}
              >
                Списание
              </button>
            </div>
          </div>

          {/* Выбор количества баллов */}
          <div className="mb-4">
            <p className="text-xs text-neon-lilac font-semibold tracking-wider mb-2 text-center">Количество баллов:</p>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`btn-neon text-lg tracking-wider ${
                    points === p ? 'btn-chrome' : 'btn-ghost'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Подтверждение */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSubmit}
              disabled={points === null}
              className={`btn-neon text-sm tracking-wider ${
                points !== null
                  ? action === 'credit' ? 'btn-cyan' : 'btn-danger'
                  : 'btn-ghost opacity-50 cursor-not-allowed'
              }`}
            >
              {action === 'credit' ? `+${points || 0}` : `-${points || 0}`}
            </button>
            <button
              onClick={handleReset}
              className="btn-neon btn-ghost text-sm tracking-wider"
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger w-full text-sm tracking-wider mt-6"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
