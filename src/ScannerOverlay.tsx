import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerOverlayProps {
  onDecoded: (rawText: string) => void;
  onCameraError: (err: Error) => void;
  onTimeout: () => void;
  onClose: () => void;
}

export default function ScannerOverlay({ onDecoded, onCameraError, onTimeout, onClose }: ScannerOverlayProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isStoppingRef = useRef(false);

  // Остановка сканера и таймера
  const stopScanner = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    // Очищаем таймаут
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Игнорируем ошибки при остановке
      }
      scannerRef.current = null;
    }
  };

  // Запуск камеры после появления узла в DOM
  useEffect(() => {
    let cancelled = false;
    let hq: Html5Qrcode | null = null;

    const begin = () => {
      if (cancelled) return;
      
      const element = document.getElementById('scanner-video');
      if (!element) {
        requestAnimationFrame(begin);
        return;
      }

      hq = new Html5Qrcode('scanner-video');
      scannerRef.current = hq;

      hq.start(
        { facingMode: 'environment' },
        { 
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        (decodedText) => {
          if (!cancelled) {
            onDecoded(decodedText);
          }
        },
        () => {} // Пустой no-op для отдельных кадров без кода
      ).then(() => {
        // Запускаем таймаут 10 секунд ПОСЛЕ успешного start()
        if (!cancelled) {
          timeoutRef.current = window.setTimeout(() => {
            if (!cancelled) {
              stopScanner();
              onTimeout();
            }
          }, 10000);
        }
      }).catch((err) => {
        // Любое падение старта → onCameraError
        if (!cancelled && err instanceof Error) {
          onCameraError(err);
        }
      });
    };

    begin();

    return () => {
      cancelled = true;
      if (hq) {
        const scanner = hq;
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Обработка закрытия
  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="modal-overlay scanner-overlay" style={{ zIndex: 200 }}>
      <div className="modal-card">
        <h3 className="text-neon-cyan fit-flow text-center" style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>
          Сканирование
        </h3>
        
        <div className="qr-frame" style={{ width: 'min(100%, 280px)', aspectRatio: '1/1', marginInline: 'auto' }}>
          <div id="scanner-video" className="overflow-hidden" style={{ width: '100%', height: '100%' }}></div>
        </div>

        <p className="fit-flow text-center" style={{ fontSize: 'clamp(10px, 2.8vw, 11px)', color: '#B9B0E6', lineHeight: 1.3 }}>
          Наведите камеру на ваш персональный QR-код
        </p>

        <button
          onClick={handleClose}
          className="btn-neon btn-ghost"
          style={{ width: '100%', height: '44px' }}
        >
          Отменить
        </button>
      </div>
    </div>
  );
}
