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
    // v17.6-diag: диагностика молчаливого отказа старта камеры
    console.log('[Scanner] mount, waiting for video node');
    cancelledRef.current = false;
    let hq: Html5Qrcode | null = null;

    const begin = () => {
      if (cancelledRef.current) return;
      
      const el = document.getElementById('scanner-video'); // id сверен с JSX (п.1.3): <div id="scanner-video">
      if (!el) {
        console.warn('[Scanner] element #scanner-video NOT FOUND, retrying...');
        requestAnimationFrame(begin);
        return;
      }
      console.log('[Scanner] found element, starting Html5Qrcode...', el.id);

      hq = new Html5Qrcode(el.id);
      hqRef.current = hq;

      const handleStartError = (err: any) => {
        // v17.6-diag: раньше ошибка могла проглатываться — теперь видна всегда
        console.error('[Scanner] start FAILED:', err?.name, err?.message);
        if (cancelledRef.current) return;
        stopSafe();
        if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          onError('denied');
        } else {
          onError('unavailable');
        }
      };

      const onDecoded = (raw: string) => {
        // v17.6-diag: фиксируем сырой текст декода до validate
        console.log('[Scanner] decoded raw text:', raw);
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

      // v17.6: параметры камеры для чтения «экран-в-экран» (куратор снимает
      // экран другого телефона): больше кадров, квадратный кадр, непрерывный
      // автофокус и компенсация бликов — терпимость к муару и слабому свету.
      const config = {
        fps: 20,                                    // вдвое чаще кадров
        qrbox: { width: 240, height: 240 },         // чуть больше зона поиска
        aspectRatio: 1,                             // квадратный кадр под QR
        disableFlip: true,                          // не тратить кадры на переворот
        supportedMediaTypes: ['video'],             // явно видео, не audio
      };
      const cameraConstraints = {
        facingMode: { ideal: 'environment' },
        width:  { ideal: 1280 }, height: { ideal: 1280 },
        focusMode: 'continuous',                    // ключевое: непрерывный автофокус
        exposureMode: 'continuous',                 // компенсация бликов экрана
      };

      // v17.6-diag: логируем фактические constraints/config непосредственно перед start()
      console.log('[Scanner] calling start with constraints', cameraConstraints);

      hq.start(
        cameraConstraints,
        config,
        onDecoded,
        () => {}
      ).then(() => {
        // v17.6-diag: старт успешен — таймер 10с активирован
        console.log('[Scanner] start() resolved OK, arming 10s timeout');
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
          {/* v17.6: визуальная подсказка — бирюзовая линия-видоискатель помогает
              инстинктивно держать телефон параллельно монитору */}
          <div className="scan-viewline" aria-hidden="true"></div>
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
