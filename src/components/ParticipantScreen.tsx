import { QRCodeSVG } from 'qrcode.react';
import { User } from '../database';
import { LogOut } from 'lucide-react';
import { SpeedingText, NeonReveal, SignalType } from './animations';

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
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title chrome-serif">
          <SignalType>ПРОФИЛЬ</SignalType>
        </h1>
        <p className="fit-flow fit-sub" style={{ marginTop: '4px', color: 'var(--muted)' }}>
          <SignalType>Участник</SignalType>
        </p>
      </div>

      {/* Holo-card — глянцевая чёрная плашка */}
      <div className="holo-card">
        <div className="center-col" style={{ paddingInline: '16px', position: 'relative', zIndex: 1 }}>
          {/* Holo-fluid подложка */}
          <div className="holo-fluid" style={{ width: '100%', marginBottom: '16px' }}></div>

          {/* 3D-хром-эмблема */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <svg style={{ width: '120px', height: '120px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'circle-rotate 36s linear infinite' }} viewBox="0 0 120 120">
              <defs>
                <path id="circle-path" d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
              </defs>
              <text style={{ fontFamily: 'Grafmassa, sans-serif', fontSize: '8px', letterSpacing: '2px', fill: 'var(--muted)' }}>
                <textPath href="#circle-path">СИСТЕМА БАЛЛОВ • POSVYAT • 2026 •</textPath>
              </text>
            </svg>
            <div className="chrome-serif" style={{ fontSize: '56px', position: 'relative', zIndex: 2, textShadow: '0 1px 0 rgba(34,29,94,.4), 0 2px 0 rgba(34,29,94,.35), 0 3px 0 rgba(34,29,94,.3), 0 4px 0 rgba(34,29,94,.25), 0 6px 12px rgba(34,29,94,.35)', animation: 'emblem-rotate 7s ease-in-out infinite' }}>
              ✦
            </div>
          </div>

          {/* Имя — chrome-serif */}
          <h2 className="text-center fit-flow chrome-serif" style={{ 
            fontSize: 'clamp(14px, 4.5vw, 18px)', 
            fontWeight: 700, 
            lineHeight: 1.25,
            maxWidth: '100%'
          }}>
            {user.fullName}
          </h2>

          {/* Строка-подпись */}
          <p style={{
            fontSize: 'clamp(10px, 3vw, 12px)',
            color: 'var(--muted)',
            letterSpacing: '0.06em',
            textAlign: 'center',
            marginTop: '8px',
            lineHeight: 1.3
          }}>
            ID: {user.id} · {user.group} · {user.points} БАЛЛОВ
          </p>
        </div>
      </div>

      {/* Группа / Баллы — таро-рамка */}
      <NeonReveal>
        <div className="hud-box">
          <span className="star-tl">✦</span>
          <span className="star-tr">✦</span>
          <span className="star-bl">✦</span>
          <span className="star-br">✦</span>
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '10px' }}>
            <div className="stat-cell">
              <p className="fit-nowrap fit-stat-l" style={{ marginBottom: '6px', color: 'var(--muted)' }}>Группа</p>
              <p className="fit-nowrap fit-stat-v" style={{ color: 'var(--text)' }}>{user.group}</p>
            </div>
            <div className="stat-cell" style={{ borderLeft: '1px solid var(--hairline)' }}>
              <p className="fit-nowrap fit-stat-l" style={{ marginBottom: '6px', color: 'var(--ir-magenta)' }}>Баллы</p>
              <p className="fit-nowrap fit-stat-v" style={{ color: 'var(--text)' }}>
                <SpeedingText value={user.points} />
              </p>
            </div>
          </div>
        </div>
      </NeonReveal>

      {/* QR-код — таро-рамка + holo-fluid + selection-рамка */}
      <NeonReveal>
        <div className="hud-box">
          <span className="star-tl">✦</span>
          <span className="star-tr">✦</span>
          <span className="star-bl">✦</span>
          <span className="star-br">✦</span>
          <span className="hud-label fit-flow fit-title">QR-КОД УЧАСТНИКА</span>
          <div className="center-col">
            {/* Holo-fluid подложка */}
            <div className="holo-fluid" style={{ width: '100%', marginBottom: '12px' }}></div>
            {/* Selection-рамка */}
            <div className="qr-frame focus-glow">
              <div className="marker tl"></div>
              <div className="marker tc"></div>
              <div className="marker tr"></div>
              <div className="marker ml"></div>
              <div className="marker mr"></div>
              <div className="marker bl"></div>
              <div className="marker bc"></div>
              <div className="marker br"></div>
              <QRCodeSVG
                value={qrValue}
                level="H"
                includeMargin={false}
                fgColor="#E8ECFF"
                bgColor="transparent"
                style={{ width: '100%', height: 'auto', display: 'block', minWidth: '180px' }}
              />
            </div>
            <p className="fit-flow fit-cap" style={{ marginTop: '12px', color: 'var(--ir-cyan)' }}>
              Покажите этот код куратору
            </p>
          </div>
        </div>
      </NeonReveal>

      {/* Кнопка выхода — outline-пилюля */}
      <button
        onClick={onLogout}
        className="btn-neon"
        style={{ 
          marginTop: 'var(--gap-block)',
          background: 'transparent',
          border: '1px solid var(--ir-magenta)',
          color: 'var(--ir-magenta)',
          boxShadow: '0 0 18px rgba(255,92,208,.25)'
        }}
      >
        <LogOut size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
        <span className="fit-btn-m2">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
