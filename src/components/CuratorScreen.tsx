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

  const isLongName = user.fullName.length > 24;

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
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">КУРАТОР</h1>
        <p className="text-neon-cyan screen-subtitle" style={{ marginTop: '4px' }}>Панель управления</p>
      </div>

      {/* Шапка — ВНЕ контейнера */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className={`text-chrome-soft text-center ${isLongName ? 'user-name user-name--long' : 'user-name'}`}>
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>ID: {user.id}</span>
      </div>

      {/* Сканирование — hud-box */}
      <div className="hud-box">
        <span className="hud-label">Сканирование QR-кода</span>
        
        {!isScanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button onClick={startScanner} className="btn-neon btn-cyan">
              Открыть камеру
            </button>
            
            <p className="text-neon-lilac screen-subtitle text-center" style={{ margin: '0' }}>
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
              <div id={scannerContainerId} className="overflow-hidden"></div>
            </div>
            <button onClick={stopScanner} className="btn-neon btn-danger">
              Остановить сканирование
            </button>
          </div>
        )}
      </div>

      {/* Информация о найденном участнике */}
      {scannedUser && (
        <div className="hud-box">
          <span className="hud-label">Участник найден</span>
          
          <div className="center-col" style={{ padding: '10px 0', marginBottom: '10px' }}>
            <p className="user-name text-white text-center">{scannedUser.fullName}</p>
            <p className="screen-subtitle text-neon-lilac" style={{ marginTop: '4px' }}>
              Группа: {scannedUser.group} • ID: {scannedUser.id}
            </p>
            <p className="stat-value text-neon-cyan" style={{ marginTop: '8px' }}>
              Баланс: {scannedUser.points}
            </p>
          </div>

          <div className="hud-divider"></div>

          {/* Действие */}
          <div style={{ marginTop: '10px', marginBottom: '14px' }}>
            <p className="stat-label text-neon-lilac text-center" style={{ marginBottom: '10px' }}>Действие</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`btn-neon btn-grid ${action === 'credit' ? 'btn-cyan' : 'btn-ghost'}`}
              >
                Зачисление
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`btn-neon btn-grid ${action === 'debit' ? 'btn-danger' : 'btn-ghost'}`}
              >
                Списание
              </button>
            </div>
          </div>

          {/* Количество баллов */}
          <div style={{ marginBottom: '14px' }}>
            <p className="stat-label text-neon-lilac text-center" style={{ marginBottom: '10px' }}>Количество баллов</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`btn-neon btn-grid ${points === p ? 'btn-chrome' : 'btn-ghost'}`}
                  style={{ fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 700 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="hud-divider"></div>

          {/* Подтверждение */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', marginTop: '10px' }}>
            <button
              onClick={handleSubmit}
              disabled={points === null}
              className={`btn-neon btn-grid ${
                points !== null
                  ? action === 'credit' ? 'btn-cyan' : 'btn-danger'
                  : 'btn-ghost'
              }`}
              style={points === null ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {action === 'credit' ? `+${points || 0}` : `-${points || 0}`}
            </button>
            <button onClick={handleReset} className="btn-neon btn-grid btn-ghost">
              Сброс
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', lineHeight: 1.3 }}>{showError}</p>
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
            <p className="text-white font-medium text-center" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', lineHeight: 1.3 }}>{showSuccess}</p>
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
