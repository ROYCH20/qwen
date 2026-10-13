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
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="h-screen text-chrome font-bold">КУРАТОР</h1>
        <p className="text-neon-cyan t-small" style={{ marginTop: '4px', letterSpacing: '0.08em' }}>Панель управления</p>
      </div>

      {/* Карточка куратора — имя целиком */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft font-bold text-center h-card" style={{ maxWidth: '100%' }}>
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>ID: {user.id}</span>
      </div>

      {/* Сканирование — func-zone */}
      <div className="func-zone">
        <span className="func-zone-label">Сканирование QR-кода</span>
        
        {!isScanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              onClick={startScanner}
              className="btn-neon btn-cyan"
            >
              Открыть камеру
            </button>
            
            <p className="text-neon-lilac t-small font-medium text-center" style={{ margin: '4px 0 8px' }}>
              или введите ID
            </p>

            <div className="flex items-stretch" style={{ gap: '10px' }}>
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="ID участника (P001)"
                className="input-neon flex-1"
                style={{ minWidth: 0 }}
              />
              <button
                onClick={handleManualScan}
                className="btn-neon btn-lilac"
                style={{ width: 'auto', paddingInline: '16px', flexShrink: 0 }}
              >
                Найти
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="qr-frame" style={{ display: 'block', width: '100%' }}>
              <span className="qr-frame-corner tl"></span>
              <span className="qr-frame-corner tr"></span>
              <span className="qr-frame-corner bl"></span>
              <span className="qr-frame-corner br"></span>
              <div id={scannerContainerId} className="overflow-hidden"></div>
            </div>
            <button
              onClick={stopScanner}
              className="btn-neon btn-danger"
            >
              Остановить сканирование
            </button>
          </div>
        )}
      </div>

      {/* Информация о найденном участнике */}
      {scannedUser && (
        <div className="panel-glass">
          <h3 className="t-label text-neon-pink text-center" style={{ marginBottom: '14px' }}>Участник найден</h3>
          <div className="center-col" style={{ padding: '14px', background: 'rgba(108, 99, 201, 0.18)', borderRadius: '16px', border: '1px solid rgba(142, 134, 228, 0.35)', marginBottom: '16px' }}>
            <p className="h-card text-white font-semibold text-center" style={{ maxWidth: '100%' }}>{scannedUser.fullName}</p>
            <p className="t-small text-neon-lilac font-medium text-center" style={{ marginTop: '4px' }}>
              Группа: {scannedUser.group} • ID: {scannedUser.id}
            </p>
            <p className="h-card text-neon-cyan font-bold text-center" style={{ marginTop: '8px' }}>
              Баланс: {scannedUser.points}
            </p>
          </div>

          {/* Действие */}
          <div style={{ marginBottom: '16px' }}>
            <p className="t-label text-neon-lilac text-center" style={{ marginBottom: '10px' }}>Действие</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`btn-neon ${action === 'credit' ? 'btn-cyan' : 'btn-ghost'}`}
              >
                Зачисление
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`btn-neon ${action === 'debit' ? 'btn-danger' : 'btn-ghost'}`}
              >
                Списание
              </button>
            </div>
          </div>

          {/* Количество баллов */}
          <div style={{ marginBottom: '16px' }}>
            <p className="t-label text-neon-lilac text-center" style={{ marginBottom: '10px' }}>Количество баллов</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`btn-neon ${points === p ? 'btn-chrome' : 'btn-ghost'}`}
                  style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 700 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Подтверждение */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
            <button
              onClick={handleSubmit}
              disabled={points === null}
              className={`btn-neon ${
                points !== null
                  ? action === 'credit' ? 'btn-cyan' : 'btn-danger'
                  : 'btn-ghost'
              }`}
              style={points === null ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {action === 'credit' ? `+${points || 0}` : `-${points || 0}`}
            </button>
            <button
              onClick={handleReset}
              className="btn-neon btn-ghost"
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="t-body text-white font-medium text-center" style={{ marginBottom: '24px' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
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
            <p className="t-body text-white font-medium text-center" style={{ marginBottom: '24px' }}>{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              Отлично
            </button>
          </div>
        </div>
      )}

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
