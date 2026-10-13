import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getUserById, updatePoints, User } from '../database';
import FitText from '../FitText';

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
        <h1 className="screen-title text-chrome">
          <FitText max={28} min={16}>КУРАТОР</FitText>
        </h1>
        <p className="text-neon-cyan screen-subtitle" style={{ marginTop: '4px' }}>
          <FitText max={15} min={10}>Панель управления</FitText>
        </p>
      </div>

      {/* Шапка — ВНЕ контейнера */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        {isLongName ? (
          <h2 className="text-chrome-soft text-center user-name user-name--long">
            {user.fullName}
          </h2>
        ) : (
          <h2 className="text-chrome-soft text-center user-name">
            <FitText max={20} min={10}>{user.fullName}</FitText>
          </h2>
        )}
        <span className="badge-neon" style={{ marginTop: '10px' }}>
          <FitText max={13} min={9}>ID: {user.id}</FitText>
        </span>
      </div>

      {/* Сканирование — hud-box */}
      <div className="hud-box">
        <span className="hud-label">Сканирование QR-кода</span>
        
        {!isScanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button onClick={startScanner} className="btn-neon btn-cyan">
              <FitText max={15} min={10}>Открыть камеру</FitText>
            </button>
            
            <p className="text-neon-lilac screen-subtitle text-center" style={{ margin: '0' }}>
              <FitText max={15} min={10}>или введите ID</FitText>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="Например: P001 участника"
                className="input-neon"
              />
              <button
                onClick={handleManualScan}
                className="btn-neon btn-lilac"
              >
                <FitText max={15} min={10}>Найти участника</FitText>
              </button>
              <p style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
                ID участника, которому начисляются или списываются баллы
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="qr-frame" style={{ display: 'block', width: '100%' }}>
              <div id={scannerContainerId} className="overflow-hidden"></div>
            </div>
            <button onClick={stopScanner} className="btn-neon btn-danger">
              <FitText max={15} min={10}>Остановить сканирование</FitText>
            </button>
          </div>
        )}
      </div>

      {/* Информация о найденном участнике */}
      {scannedUser && (
        <div className="hud-box">
          <span className="hud-label">Участник найден</span>
          
          <div className="center-col" style={{ padding: '10px 0', marginBottom: '10px' }}>
            {scannedUser.fullName.length > 24 ? (
              <p className="user-name text-white text-center user-name--long">{scannedUser.fullName}</p>
            ) : (
              <p className="user-name text-white text-center">
                <FitText max={20} min={10}>{scannedUser.fullName}</FitText>
              </p>
            )}
            <p className="screen-subtitle text-neon-lilac" style={{ marginTop: '4px' }}>
              <FitText max={15} min={9}>Группа: {scannedUser.group} • ID: {scannedUser.id}</FitText>
            </p>
            <p className="stat-value text-neon-cyan" style={{ marginTop: '8px' }}>
              <FitText max={20} min={12}>Баланс: {scannedUser.points}</FitText>
            </p>
          </div>

          <div className="hud-divider"></div>

          {/* Действие */}
          <div style={{ marginTop: '10px', marginBottom: '14px' }}>
            <p className="stat-label text-neon-lilac text-center" style={{ marginBottom: '10px' }}>
              <FitText max={12} min={7}>Действие</FitText>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`btn-neon btn-grid ${action === 'credit' ? 'btn-cyan' : 'btn-ghost'}`}
              >
                <FitText max={14} min={8}>Зачисление</FitText>
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`btn-neon btn-grid ${action === 'debit' ? 'btn-danger' : 'btn-ghost'}`}
              >
                <FitText max={14} min={8}>Списание</FitText>
              </button>
            </div>
          </div>

          {/* Количество баллов */}
          <div style={{ marginBottom: '14px' }}>
            <p className="stat-label text-neon-lilac text-center" style={{ marginBottom: '10px' }}>
              <FitText max={12} min={7}>Количество баллов</FitText>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`btn-neon btn-grid ${points === p ? 'btn-chrome' : 'btn-ghost'}`}
                  style={{ fontWeight: 700 }}
                >
                  <FitText max={18} min={10}>{p}</FitText>
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
              <FitText max={14} min={8}>{action === 'credit' ? `+${points || 0}` : `-${points || 0}`}</FitText>
            </button>
            <button onClick={handleReset} className="btn-neon btn-grid btn-ghost">
              <FitText max={14} min={8}>Сброс</FitText>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center text-wrap-balance" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <FitText max={15} min={10}>Понятно</FitText>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно успеха */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center text-wrap-balance" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <FitText max={15} min={10}>Отлично</FitText>
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
        <FitText max={15} min={10}>Выйти из аккаунта</FitText>
      </button>
    </div>
  );
}
