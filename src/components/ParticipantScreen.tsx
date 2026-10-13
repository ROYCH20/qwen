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

  const isLongName = user.fullName.length > 24;

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок экрана */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">ПРОФИЛЬ</h1>
        <p className="text-neon-lilac screen-subtitle" style={{ marginTop: '4px' }}>Участник</p>
      </div>

      {/* Шапка профиля — ВНЕ контейнера */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className={`text-chrome-soft text-center ${isLongName ? 'user-name user-name--long' : 'user-name'}`}>
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>ID: {user.id}</span>
      </div>

      {/* Группа / Баллы — hud-box с двумя колонками и hud-vdiv */}
      <div className="hud-box">
        <div className="flex items-stretch justify-around" style={{ gap: '12px' }}>
          <div className="flex-1 center-col" style={{ padding: '8px 0' }}>
            <p className="stat-label text-neon-lilac" style={{ marginBottom: '6px' }}>Группа</p>
            <p className="stat-value text-white">{user.group}</p>
          </div>
          <div className="hud-vdiv"></div>
          <div className="flex-1 center-col" style={{ padding: '8px 0' }}>
            <p className="stat-label text-neon-pink" style={{ marginBottom: '6px' }}>Баллы</p>
            <p className="stat-value text-white">{user.points}</p>
          </div>
        </div>
      </div>

      {/* QR-код — hud-box */}
      <div className="hud-box">
        <span className="hud-label">QR-код участника</span>
        <div className="center-col">
          <div className="qr-frame">
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
          <p className="text-neon-cyan screen-subtitle" style={{ marginTop: '12px' }}>
            Покажите этот код куратору
          </p>
        </div>
      </div>

      {/* Информация — hud-box */}
      <div className="hud-box">
        <span className="hud-label">Информация</span>
        <div className="flex justify-between items-center" style={{ padding: '4px 0' }}>
          <span className="info-label text-neon-lilac">ФИО</span>
          <span className="info-value text-white">{user.fullName}</span>
        </div>
        <div className="hud-divider"></div>
        <div className="flex justify-between items-center" style={{ padding: '4px 0' }}>
          <span className="info-label text-neon-lilac">Группа</span>
          <span className="info-value text-white">{user.group}</span>
        </div>
        <div className="hud-divider"></div>
        <div className="flex justify-between items-center" style={{ padding: '4px 0' }}>
          <span className="info-label text-neon-lilac">Баллы</span>
          <span className="info-value text-neon-pink">{user.points}</span>
        </div>
        <div className="hud-divider"></div>
        <div className="flex justify-between items-center" style={{ padding: '4px 0' }}>
          <span className="info-label text-neon-lilac">Роль</span>
          <span className="badge-neon">Участник</span>
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
