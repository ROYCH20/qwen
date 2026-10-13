import { QRCodeSVG } from 'qrcode.react';
import { User } from '../database';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ParticipantScreen({ user, onLogout }: Props) {
  const qrValue = JSON.stringify({
    userId: user.id,
    role: user.role,
    type: 'participant_qr'
  });

  return (
    <div className="pt-8">
      {/* Заголовок */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="h-screen text-chrome font-bold">ПРОФИЛЬ</h1>
        <p className="text-neon-lilac t-small" style={{ marginTop: '4px', letterSpacing: '0.08em' }}>Участник</p>
      </div>

      {/* Карточка профиля — имя целиком хром-градиентом */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft font-bold text-center h-card" style={{ maxWidth: '100%' }}>
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>ID: {user.id}</span>
      </div>

      {/* Статистика Группа / Баллы */}
      <div className="panel-glass">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <div className="center-col" style={{ padding: '14px 10px', background: 'rgba(108, 99, 201, 0.18)', borderRadius: '16px', border: '1px solid rgba(142, 134, 228, 0.35)' }}>
            <p className="t-label text-neon-lilac" style={{ marginBottom: '6px' }}>Группа</p>
            <p className="h-card text-white font-bold">{user.group}</p>
          </div>
          <div className="center-col" style={{ padding: '14px 10px', background: 'rgba(247, 155, 227, 0.12)', borderRadius: '16px', border: '1px solid rgba(247, 155, 227, 0.35)' }}>
            <p className="t-label text-neon-pink" style={{ marginBottom: '6px' }}>Баллы</p>
            <p className="h-card text-white font-bold">{user.points}</p>
          </div>
        </div>
      </div>

      {/* QR-код — func-zone + qr-frame */}
      <div className="func-zone">
        <span className="func-zone-label">QR-код участника</span>
        <div className="center-col">
          <div className="qr-frame">
            <span className="qr-frame-corner tl"></span>
            <span className="qr-frame-corner tr"></span>
            <span className="qr-frame-corner bl"></span>
            <span className="qr-frame-corner br"></span>
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#221D5E"
              bgColor="#F5F2FF"
              style={{ width: '100%', height: 'auto', maxWidth: '220px', display: 'block' }}
            />
          </div>
          <p className="text-neon-cyan t-small font-medium text-center" style={{ marginTop: '12px', textShadow: '0 0 8px rgba(111, 227, 236, 0.5)' }}>
            Покажите этот код куратору
          </p>
        </div>
      </div>

      {/* Информация — panel-glass */}
      <div className="panel-glass">
        <h4 className="t-label text-neon-lilac text-center" style={{ marginBottom: '14px' }}>Информация</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex justify-between items-start" style={{ gap: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(223, 183, 239, 0.15)' }}>
            <span className="t-small text-neon-lilac font-medium" style={{ flexShrink: 0 }}>ФИО:</span>
            <span className="t-body text-white font-semibold text-right" style={{ maxWidth: '70%' }}>{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center" style={{ gap: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(223, 183, 239, 0.15)' }}>
            <span className="t-small text-neon-lilac font-medium" style={{ flexShrink: 0 }}>Группа:</span>
            <span className="t-body text-white font-semibold text-right">{user.group}</span>
          </div>
          <div className="flex justify-between items-center" style={{ gap: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(223, 183, 239, 0.15)' }}>
            <span className="t-small text-neon-lilac font-medium" style={{ flexShrink: 0 }}>Баллы:</span>
            <span className="h-card text-neon-pink font-bold text-right">{user.points}</span>
          </div>
          <div className="flex justify-between items-center" style={{ gap: '12px' }}>
            <span className="t-small text-neon-lilac font-medium" style={{ flexShrink: 0 }}>Роль:</span>
            <span className="badge-neon">Участник</span>
          </div>
        </div>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
