import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getUserById, updatePoints, User } from '../database';
import { LogOut, ScanLine } from 'lucide-react';
import { SignalType, AnimatedList, AnimatedListItem, NeonReveal, SpeedingText } from './animations';

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
        <h1 className="screen-title chrome-serif">
          <SignalType>КУРАТОР</SignalType>
        </h1>
        <p className="fit-flow fit-sub" style={{ marginTop: '4px', color: 'var(--muted)' }}>
          <SignalType>Панель управления</SignalType>
        </p>
      </div>

      {/* Holo-card */}
      <div className="holo-card">
        <div className="center-col" style={{ paddingInline: '16px', position: 'relative', zIndex: 1 }}>
          {/* Holo-fluid подложка */}
          <div className="holo-fluid" style={{ width: '100%', marginBottom: '16px' }}></div>

          {/* 3D-хром-эмблема */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <svg style={{ width: '120px', height: '120px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'circle-rotate 36s linear infinite' }} viewBox="0 0 120 120">
              <defs>
                <path id="circle-path" d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
              </defs>
              <text style={{ fontFamily: 'Grafmassa, sans-serif', fontSize: '8px', letterSpacing: '2px', fill: 'var(--muted)' }}>
                <textPath href="#circle-path">СИСТЕМА БАЛЛОВ • POSVYAT • 2026 •</textPath>
              </text>
            </svg>
            <div className="chrome-serif" style={{ fontSize: '56px', position: 'relative', zIndex: 2, textShadow: '0 1px 0 rgba(34,29,94,.4), 0 2px 0 rgba(34,29,94,.35), 0 3px 0 rgba(34,29,94,.3), 0 4px 0 rgba(34,29,94,.25), 0 6px 12px rgba(34,29,94,.35)', animation: 'emblem-rotate 7s ease-in-out infinite' }}>
              ✦
            </div>
          </div>

          {/* Имя — chrome-serif */}
          <h2 className="text-center fit-flow chrome-serif" style={{ 
            fontSize: 'clamp(14px, 4.5vw, 18px)', 
            fontWeight: 700, 
            lineHeight: 1.25,
            maxWidth: '100%'
          }}>
            {user.fullName}
          </h2>

          {/* Строка-подпись */}
          <p style={{
            fontSize: 'clamp(10px, 3vw, 12px)',
            color: 'var(--muted)',
            letterSpacing: '0.06em',
            textAlign: 'center',
            marginTop: '8px',
            lineHeight: 1.3
          }}>
            ID: {user.id} · КУРАТОР
          </p>
        </div>
      </div>

      {/* Сканирование — таро-рамка */}
      <NeonReveal>
        <div className="hud-box">
          <span className="star-tl">✦</span>
          <span className="star-tr">✦</span>
          <span className="star-bl">✦</span>
          <span className="star-br">✦</span>
          <span className="hud-label fit-flow fit-title">СКАНИРОВАНИЕ QR-КОДА</span>
          
          {!isScanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button onClick={startScanner} className="btn-neon btn-cyan focus-glow">
                <ScanLine size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
                <span className="fit-btn-m">Открыть камеру</span>
              </button>
              
              <p className="fit-flow fit-sub text-center" style={{ margin: '0', color: 'var(--muted)' }}>
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
                <p style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  ID участника, которому начисляются или списываются баллы
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Selection-рамка для камеры */}
              <div className="qr-frame">
                <div className="marker tl"></div>
                <div className="marker tc"></div>
                <div className="marker tr"></div>
                <div className="marker ml"></div>
                <div className="marker mr"></div>
                <div className="marker bl"></div>
                <div className="marker bc"></div>
                <div className="marker br"></div>
                <div id={scannerContainerId} className="overflow-hidden"></div>
              </div>
              <button onClick={stopScanner} className="btn-neon btn-danger">
                <span className="fit-btn-m">Остановить сканирование</span>
              </button>
            </div>
          )}
        </div>
      </NeonReveal>

      {/* Информация о найденном участнике */}
      {scannedUser && (
        <NeonReveal>
          <div className="hud-box">
            <span className="star-tl">✦</span>
            <span className="star-tr">✦</span>
            <span className="star-bl">✦</span>
            <span className="star-br">✦</span>
            <span className="hud-label fit-flow fit-title">УЧАСТНИК НАЙДЕН</span>
            
            <div className="center-col" style={{ padding: '10px 0', marginBottom: '10px' }}>
              <p className="user-name text-center fit-flow" style={{ color: 'var(--text)' }}>{scannedUser.fullName}</p>
              <p className="fit-flow fit-sub" style={{ marginTop: '4px', color: 'var(--muted)' }}>
                Группа: {scannedUser.group} · ID: {scannedUser.id}
              </p>
              <p className="fit-nowrap fit-stat-v" style={{ marginTop: '8px', color: 'var(--ir-cyan)' }}>
                Баланс: <SpeedingText value={scannedUser.points} />
              </p>
            </div>

            <div className="hud-divider"></div>

            {/* Действие */}
            <div style={{ marginTop: '10px', marginBottom: '14px' }}>
              <p className="fit-nowrap fit-stat-l text-center" style={{ marginBottom: '10px', color: 'var(--muted)' }}>
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
              <p className="fit-flow fit-stat-l text-center" style={{ marginBottom: '10px', color: 'var(--muted)' }}>
                Количество баллов
              </p>
              <AnimatedList className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
                {[50, 100, 150].map(p => (
                  <AnimatedListItem key={p}>
                    <button
                      onClick={() => { setPoints(p); setShowError(''); }}
                      className={`btn-neon ${points === p ? 'btn-chrome' : 'btn-ghost'}`}
                      style={{ fontWeight: 700 }}
                    >
                      <span className="fit-nowrap fit-stat-v">{p}</span>
                    </button>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
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
        </NeonReveal>
      )}

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', color: 'var(--text)' }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">ПОНЯТНО</span>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно успеха */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', color: 'var(--text)' }}>{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">ОТЛИЧНО</span>
            </button>
          </div>
        </div>
      )}

      {/* Кнопка выхода — outline-пилюля */}
      <button
        onClick={onLogout}
        className="btn-neon"
        style={{ 
          marginTop: 'var(--gap-block)',
          background: 'transparent',
          border: '1px solid var(--ir-magenta)',
          color: 'var(--ir-magenta)',
          boxShadow: '0 0 18px rgba(255,92,208,.25)'
        }}
      >
        <LogOut size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
        <span className="fit-btn-m2">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
