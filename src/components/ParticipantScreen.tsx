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
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок экрана */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">ПРОФИЛЬ</h1>
        <p className="text-neon-lilac fit-flow fit-sub" style={{ marginTop: '4px' }}>
          Участник
        </p>
      </div>

      {/* Шапка профиля */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft text-center user-name fit-flow">
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>
          <span className="fit-nowrap" style={{ fontSize: 'clamp(10px, 3vw, 13px)' }}>ID: {user.id}</span>
        </span>
      </div>

      {/* Группа / Баллы */}
      <div className="hud-box">
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '10px' }}>
          <div className="stat-cell">
            <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginBottom: '6px' }}>Группа</p>
            <p className="fit-nowrap fit-stat-v text-white">{user.group}</p>
          </div>
          <div className="stat-cell" style={{ borderLeft: '1px solid rgba(223,183,239,.25)' }}>
            <p className="fit-nowrap fit-stat-l text-neon-pink" style={{ marginBottom: '6px' }}>Баллы</p>
            <p className="fit-nowrap fit-stat-v text-white">{user.points}</p>
          </div>
        </div>
      </div>

      {/* QR-код */}
      <div className="hud-box">
        <span className="hud-label fit-flow fit-title">QR-КОД УЧАСТНИКА</span>
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
          <p className="text-neon-cyan fit-flow fit-cap" style={{ marginTop: '12px' }}>
            Покажите этот код куратору
          </p>
        </div>
      </div>

      {/* Информация */}
      <div className="hud-box">
        <span className="hud-label fit-flow fit-title">ИНФОРМАЦИЯ</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="kv-row" style={{ padding: '4px 0' }}>
            <span className="k text-neon-lilac">ФИО</span>
            <span className="v text-white fit-flow">{user.fullName}</span>
          </div>
          <div className="hud-divider"></div>
          <div className="kv-row" style={{ padding: '4px 0' }}>
            <span className="k text-neon-lilac">Группа</span>
            <span className="v text-white fit-nowrap fit-stat-v">{user.group}</span>
          </div>
          <div className="hud-divider"></div>
          <div className="kv-row" style={{ padding: '4px 0' }}>
            <span className="k text-neon-lilac">Баллы</span>
            <span className="v text-neon-pink fit-nowrap fit-stat-v">{user.points}</span>
          </div>
          <div className="hud-divider"></div>
          <div className="kv-row" style={{ padding: '4px 0' }}>
            <span className="k text-neon-lilac">Роль</span>
            <span className="badge-neon" style={{ justifySelf: 'end' }}>
              <span className="fit-nowrap" style={{ fontSize: 'clamp(10px, 3vw, 13px)' }}>Участник</span>
            </span>
          </div>
        </div>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <span className="fit-nowrap fit-btn3">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
