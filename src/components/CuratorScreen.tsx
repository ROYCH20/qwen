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
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">КУРАТОР</h1>
        <p className="text-neon-cyan fit-flow fit-sub" style={{ marginTop: '4px' }}>
          Панель управления
        </p>
      </div>

      {/* Шапка */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft text-center user-name fit-flow">
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>
          <span className="fit-nowrap" style={{ fontSize: 'clamp(10px, 3vw, 13px)' }}>ID: {user.id}</span>
        </span>
      </div>

      {/* Сканирование */}
      <div className="hud-box">
        <span className="hud-label fit-flow fit-title">СКАНИРОВАНИЕ QR-КОДА</span>
        
        {!isScanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button onClick={startScanner} className="btn-neon btn-cyan">
              <span className="fit-btn-m">Открыть камеру</span>
            </button>
            
            <p className="text-neon-lilac fit-flow fit-sub text-center" style={{ margin: '0' }}>
              или введите ID
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="Например: P001"
                className="input-neon"
              />
              <button onClick={handleManualScan} className="btn-neon btn-lilac">
                <span className="fit-btn-m">Найти участника</span>
              </button>
              <p style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
                ID участника, которому начисляются или списываются баллы
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="qr-frame">
              <div id={scannerContainerId} className="overflow-hidden"></div>
            </div>
            <button onClick={stopScanner} className="btn-neon btn-danger">
              <span className="fit-btn-m">Остановить сканирование</span>
            </button>
          </div>
        )}
      </div>

      {/* Информация о найденном участнике */}
      {scannedUser && (
        <div className="hud-box">
          <span className="hud-label fit-flow fit-title">УЧАСТНИК НАЙДЕН</span>
          
          <div className="center-col" style={{ padding: '10px 0', marginBottom: '10px' }}>
            <p className="user-name text-white text-center fit-flow">{scannedUser.fullName}</p>
            <p className="fit-flow fit-sub text-neon-lilac" style={{ marginTop: '4px' }}>
              Группа: {scannedUser.group} • ID: {scannedUser.id}
            </p>
            <p className="fit-nowrap fit-stat-v text-neon-cyan" style={{ marginTop: '8px' }}>
              Баланс: {scannedUser.points}
            </p>
          </div>

          <div className="hud-divider"></div>

          {/* Действие */}
          <div style={{ marginTop: '10px', marginBottom: '14px' }}>
            <p className="fit-nowrap fit-stat-l text-neon-lilac text-center" style={{ marginBottom: '10px' }}>
              Действие
            </p>
            <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`btn-neon ${action === 'credit' ? 'btn-cyan' : 'btn-ghost'}`}
              >
                <span className="fit-nowrap fit-btn2">Зачисление</span>
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`btn-neon ${action === 'debit' ? 'btn-danger' : 'btn-ghost'}`}
              >
                <span className="fit-nowrap fit-btn2">Списание</span>
              </button>
            </div>
          </div>

          {/* Количество баллов */}
          <div style={{ marginBottom: '14px' }}>
            <p className="fit-flow fit-stat-l text-neon-lilac text-center" style={{ marginBottom: '10px' }}>
              Количество баллов
            </p>
            <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`btn-neon ${points === p ? 'btn-chrome' : 'btn-ghost'}`}
                  style={{ fontWeight: 700 }}
                >
                  <span className="fit-nowrap fit-stat-v">{p}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hud-divider"></div>

          {/* Подтверждение */}
          <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', marginTop: '10px' }}>
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
              <span className="fit-nowrap fit-btn2">{action === 'credit' ? `+${points || 0}` : `-${points || 0}`}</span>
            </button>
            <button onClick={handleReset} className="btn-neon btn-ghost">
              <span className="fit-nowrap fit-btn2">Сброс</span>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">Понятно</span>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно успеха */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">Отлично</span>
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
        <span className="fit-btn-m2">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
