import { useState, useEffect, useRef } from 'react';
import { getUserById } from '../database';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine } from 'lucide-react';
import { SignalType, NeonReveal, AnimatedList, AnimatedListItem } from './animations';

interface Props {
  onLogin: (userId: string) => void;
}

export default function RegistrationScreen({ onLogin }: Props) {
  const [showError, setShowError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-registration';

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
    
    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const trimmedId = decodedText.trim();
          const user = getUserById(trimmedId);
          
          if (user) {
            scanner.stop().catch(() => {});
            setIsScanning(false);
            onLogin(user.id);
          } else {
            setShowError(`Пользователь с ID "${trimmedId}" не найден в системе!`);
            scanner.stop().catch(() => {});
            setIsScanning(false);
          }
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      setShowError('Нет доступа к камере.');
      setIsScanning(false);
    }
  };

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">
          <SignalType>СИСТЕМА</SignalType>
        </h1>
        <h2 className="text-chrome-soft fit-flow fit-sub" style={{ marginTop: '4px', letterSpacing: '0.08em', fontWeight: 700 }}>
          <SignalType>БАЛЛОВ</SignalType>
        </h2>
      </div>

      {/* Вход по QR */}
      <NeonReveal>
        <div className="hud-box">
          <span className="hud-label fit-flow fit-title">ВХОД ПО QR</span>
          
          {!isScanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button onClick={startScanner} className="btn-neon btn-cyan focus-glow">
                <ScanLine size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
                <span className="fit-btn-m">Открыть камеру</span>
              </button>
              <p style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
                Наведите камеру на ваш персональный QR-код
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="qr-frame">
                <div id={scannerContainerId} className="overflow-hidden"></div>
              </div>
              <button onClick={() => {
                if (scannerRef.current) {
                  scannerRef.current.stop().catch(() => {});
                }
                setIsScanning(false);
              }} className="btn-neon btn-danger">
                <span className="fit-btn-m">Отменить</span>
              </button>
            </div>
          )}
        </div>
      </NeonReveal>

      {/* Быстрый доступ */}
      <div style={{ marginBottom: 'var(--gap-block)' }}>
        <p className="center-col text-neon-lilac fit-flow fit-sub" style={{ marginBottom: '12px', fontWeight: 500 }}>
          Быстрый доступ
        </p>
        <AnimatedList className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
          <AnimatedListItem>
            <button onClick={() => onLogin('P001')} className="btn-neon btn-cyan">
              <span className="fit-nowrap fit-btn3">Участник</span>
            </button>
          </AnimatedListItem>
          <AnimatedListItem>
            <button onClick={() => onLogin('C001')} className="btn-neon btn-lilac">
              <span className="fit-nowrap fit-btn3">Куратор</span>
            </button>
          </AnimatedListItem>
          <AnimatedListItem>
            <button onClick={() => onLogin('A001')} className="btn-neon btn-danger">
              <span className="fit-nowrap fit-btn3">Админ</span>
            </button>
          </AnimatedListItem>
        </AnimatedList>
      </div>

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p className="text-white font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink modal-btn"
            >
              ПОНЯТНО
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
