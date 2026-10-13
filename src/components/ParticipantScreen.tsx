import { QRCodeSVG } from 'qrcode.react';
import { User } from '../database';
import FitText from '../FitText';

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
        <h1 className="screen-title text-chrome">
          <FitText max={28} min={14}>ПРОФИЛЬ</FitText>
        </h1>
        <p className="text-neon-lilac screen-subtitle" style={{ marginTop: '4px' }}>
          <FitText max={16} min={10}>Участник</FitText>
        </p>
      </div>

      {/* Шапка профиля — ВНЕ контейнера */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        {isLongName ? (
          <h2 className="text-chrome-soft text-center user-name user-name--long">
            {user.fullName}
          </h2>
        ) : (
          <h2 className="text-chrome-soft text-center user-name">
            <FitText max={20} min={10}>{user.fullName}</FitText>
          </h2>
        )}
        <span className="badge-neon" style={{ marginTop: '10px' }}>
          <FitText max={13} min={9}>ID: {user.id}</FitText>
        </span>
      </div>

      {/* Группа / Баллы — hud-box с двумя stat-cell */}
      <div className="hud-box">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '10px' }}>
          <div className="stat-cell">
            <p className="stat-label text-neon-lilac" style={{ marginBottom: '6px' }}>
              <FitText max={12} min={7}>Группа</FitText>
            </p>
            <p className="stat-value text-white">
              <FitText max={16} min={9}>{user.group}</FitText>
            </p>
          </div>
          <div className="stat-cell" style={{ borderLeft: '1px solid rgba(223,183,239,.25)' }}>
            <p className="stat-label text-neon-pink" style={{ marginBottom: '6px' }}>
              <FitText max={12} min={7}>Баллы</FitText>
            </p>
            <p className="stat-value text-white">
              <FitText max={16} min={9}>{user.points}</FitText>
            </p>
          </div>
        </div>
      </div>

      {/* QR-код — hud-box */}
      <div className="hud-box">
        <span className="hud-label">
          <FitText max={16} min={9}>QR-КОД УЧАСТНИКА</FitText>
        </span>
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
            <FitText max={13} min={9}>Покажите этот код куратору</FitText>
          </p>
        </div>
      </div>

      {/* Информация — hud-box */}
      <div className="hud-box">
        <span className="hud-label">
          <FitText max={16} min={9}>ИНФОРМАЦИЯ</FitText>
        </span>
        <div className="flex justify-between items-center" style={{ padding: '4px 0', gap: '10px' }}>
          <span className="info-label text-neon-lilac flex-shrink-0">ФИО</span>
          <div className="flex-1 min-w-0 text-right">
            {isLongName ? (
              <span className="info-value text-white text-wrap-balance">{user.fullName}</span>
            ) : (
              <FitText max={14} min={11}>{user.fullName}</FitText>
            )}
          </div>
        </div>
        <div className="hud-divider"></div>
        <div className="flex justify-between items-center" style={{ padding: '4px 0', gap: '10px' }}>
          <span className="info-label text-neon-lilac flex-shrink-0">Группа</span>
          <span className="info-value text-white">
            <FitText max={13} min={9}>{user.group}</FitText>
          </span>
        </div>
        <div className="hud-divider"></div>
        <div className="flex justify-between items-center" style={{ padding: '4px 0', gap: '10px' }}>
          <span className="info-label text-neon-lilac flex-shrink-0">Баллы</span>
          <span className="info-value text-neon-pink">
            <FitText max={13} min={9}>{user.points}</FitText>
          </span>
        </div>
        <div className="hud-divider"></div>
        <div className="flex justify-between items-center" style={{ padding: '4px 0', gap: '10px' }}>
          <span className="info-label text-neon-lilac flex-shrink-0">Роль</span>
          <span className="badge-neon">
            <FitText max={13} min={9}>Участник</FitText>
          </span>
        </div>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <FitText max={15} min={10}>Выйти из аккаунта</FitText>
      </button>
    </div>
  );
}
