interface ErrorModalProps {
  kind: 'denied' | 'unavailable' | 'invalid' | 'timeout' | null;
  onRetry: () => void;
  onClose: () => void;
}

export default function ErrorModal({ kind, onRetry, onClose }: ErrorModalProps) {
  if (kind === null) return null;

  const messages = {
    denied: {
      title: 'Вы запретили доступ к камере. Попробуйте еще раз.',
      hint: 'Разрешите доступ к камере в настройках сайта или откройте приложение в мобильном приложении VK.'
    },
    unavailable: {
      title: 'Не удалось получить доступ к камере. Попробуйте еще раз.',
      hint: 'В веб-версии доступ к камере может быть ограничен. Откройте приложение в мобильном приложении VK.'
    },
    invalid: {
      title: 'Отсканирован неверный QR-код. Проверьте код и попробуйте еще раз.',
      hint: null
    },
    timeout: {
      title: 'Не удалось отсканировать QR-код. Попробуйте еще раз.',
      hint: null
    }
  };

  const message = messages[kind];

  return (
    <div className="modal-overlay" style={{ zIndex: 210 }}>
      <div className="modal-card">
        <p className="fit-flow text-center" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
          {message.title}
        </p>
        {message.hint && (
          <p className="fit-flow text-center" style={{ fontSize: 'clamp(10px, 2.8vw, 11px)', color: '#B9B0E6', lineHeight: 1.3 }}>
            {message.hint}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button
            onClick={onRetry}
            className="btn-neon btn-cyan modal-btn"
          >
            Попробовать еще раз
          </button>
          <button
            onClick={onClose}
            className="btn-neon btn-ghost modal-btn"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
