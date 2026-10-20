import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerOverlayProps {
  validate: (raw: string) => string | null;   // сырой decode → валидный id или null
  onResult: (validId: string) => void;        // validate вернул id
  onError:  (kind: 'denied'|'unavailable'|'invalid'|'timeout') => void;
  onCancel: () => void;
}

export default function ScannerOverlay({ validate, onResult, onError, onCancel }: ScannerOverlayProps) {
  const hqRef = useRef<Html5Qrcode | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  const stopSafe = () => {
    try {
      if (hqRef.current) {
        hqRef.current.stop().then(() => hqRef.current?.clear()).catch(() => {});
        hqRef.current = null;
      }
    } catch {}
  };

  useEffect(() => {
    cancelledRef.current = false;
    let hq: Html5Qrcode | null = null;

    const begin = () => {
      if (cancelledRef.current) return;
      
      const element = document.getElementById('scanner-video');
      if (!element) {
        requestAnimationFrame(begin);
        return;
      }

      hq = new Html5Qrcode('scanner-video');
      hqRef.current = hq;

      const handleStartError = (err: any) => {
        if (cancelledRef.current) return;
        stopSafe();
        if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          onError('denied');
        } else {
          onError('unavailable');
        }
      };

      const onDecoded = (raw: string) => {
        if (cancelledRef.current) return;
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        const id = validate(raw);
        if (id == null) {
          stopSafe();
          onError('invalid');
          return;
        }

        stopSafe();
        onResult(id);
      };

      hq.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        onDecoded,
        () => {}
      ).then(() => {
        if (cancelledRef.current) return;
        timeoutRef.current = window.setTimeout(() => {
          if (cancelledRef.current) return;
          stopSafe();
          onError('timeout');
        }, 10000);
      }).catch(handleStartError);
    };

    begin();

    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      stopSafe();
    };
  }, []);

  const handleCancel = () => {
    stopSafe();
    onCancel();
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
          onClick={handleCancel}
          className="btn-neon btn-ghost"
          style={{ width: '100%', height: '44px' }}
        >
          Отменить
        </button>
      </div>
    </div>
  );
}
