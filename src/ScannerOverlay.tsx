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
  // v17.6-hotfix: страховки для таймера 10с и флага успешного декода
  const timerStartedRef = useRef(false);
  const decodedOnceRef = useRef(false);

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
    timerStartedRef.current = false;
    decodedOnceRef.current = false;

    const begin = () => {
      if (cancelledRef.current) return;

      const el = document.getElementById('scanner-video'); // id сверен с JSX: <div id="scanner-video">
      if (!el) {
        // без этой ветки молчаливый ретрай был неотличим от зависания
        console.warn('[Scanner] element #scanner-video NOT FOUND, retrying...');
        requestAnimationFrame(begin);
        return;
      }

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
        console.log('[Scanner] decoded raw text:', raw);
        if (cancelledRef.current) return;
        decodedOnceRef.current = true;
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

      // --- v17.6-hotfix НАЧАЛО ЗАМЕНЫ ---
      // Корень бага: html5-qrcode некорректно обрабатывает сложные constraints
      // (focusMode/exposureMode/width/height как объекты {ideal}) и возвращает
      // пустую ошибку ('undefined undefined'). Лечим упрощением до базовых
      // параметров + улучшенным логированием.
      const simpleConstraints = { facingMode: 'environment' }; // Только базовое ограничение!
      const scanConfig = { fps: 10, qrbox: { width: 200, height: 200 } }; // Стандартная конфигурация

      console.log('[Scanner] Starting with SIMPLE constraints:', simpleConstraints);

      hqRef.current = new Html5Qrcode('scanner-video');

      hqRef.current.start(
        simpleConstraints,
        scanConfig,
        onDecoded,
        () => { /* noop per-frame error */ }
      ).then(() => {
        console.log('[Scanner] Camera started successfully.');
        // Здесь запускаем таймер 10с (если он еще не запущен)
        if (!timerStartedRef.current) {
          timerStartedRef.current = true;
          timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            if (!decodedOnceRef.current && !cancelledRef.current) {
              stopSafe();
              onError('timeout');
            }
          }, 10_000);
        }
      }).catch((err) => {
        // Улучшенный логгер ошибки
        console.error('[Scanner] Start failed details:', err);
        console.error('[Scanner] Error name:', err?.name);
        console.error('[Scanner] Error message:', err?.message);

        // Если err пустой или неизвестный тип — считаем его 'unavailable'
        if (!err || !err.name) {
          if (cancelledRef.current) return;
          stopSafe();
          onError('unavailable');
        } else {
          handleStartError(err); // Используем существующий обработчик для известных типов
        }
      });
      // --- v17.6-hotfix КОНЕЦ ЗАМЕНЫ ---
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
