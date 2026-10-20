import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerOverlayProps {
  onDecoded: (rawText: string) => void;
  onCameraError: (err: Error) => void;
  onClose: () => void;
}

export default function ScannerOverlay({ onDecoded, onCameraError, onClose }: ScannerOverlayProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-overlay';
  const isStoppingRef = useRef(false);

  // Остановка сканера
  const stopScanner = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

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

  // Запуск камеры при монтировании
  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (mounted) {
              onDecoded(decodedText);
            }
          },
          () => {} // Игнорируем ошибки сканирования
        );
      } catch (err) {
        if (mounted && err instanceof Error) {
          onCameraError(err);
        }
      }
    };

    startScanner();

    // Cleanup при размонтировании
    return () => {
      mounted = false;
      stopScanner();
    };
  }, [onDecoded, onCameraError]);

  // Обработка закрытия
  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="modal-card">
        <h3 className="text-neon-cyan fit-flow text-center" style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>
          Сканирование
        </h3>
        
        <div className="qr-frame" style={{ width: 'min(100%, 280px)', aspectRatio: '1/1', marginInline: 'auto' }}>
          <div id={scannerContainerId} className="overflow-hidden" style={{ width: '100%', height: '100%' }}></div>
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
