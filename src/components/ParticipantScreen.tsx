import { QRCodeSVG } from 'qrcode.react';
import { User } from '../database';
import { LogOut } from 'lucide-react';
import { CipherText, SpeedingText, AnimatedList, AnimatedListItem, NeonReveal, SignalType } from './animations';

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
      <div className="center-col screen-head" style={{ marginBottom: '8px' }}>
        <h1 className="screen-title text-chrome">
          <SignalType>ПРОФИЛЬ</SignalType>
        </h1>
        <p className="text-neon-lilac fit-flow fit-sub" style={{ marginTop: '4px' }}>
          <SignalType>Участник</SignalType>
        </p>
      </div>

      {/* ASCII-маркиза */}
      <div className="ascii-marquee">
        <div className="ascii-marquee-inner">
          ░▒▓█▓▒░・アィウエオ・01 ░▒▓█▓▒░・アィウエオ・01 ░▒▓█▓▒░・アィウエオ・01 ░▒▓█▓▒░・アィウエオ・01
        </div>
      </div>

      {/* Holo-card */}
      <div className="holo-card">
        <div className="holo-card-inner center-col" style={{ paddingInline: '16px' }}>
          {/* 3D-хром-эмблема */}
          <div className="holo-emblem-wrap">
            <svg className="holo-circle-text" viewBox="0 0 120 120">
              <defs>
                <path id="circle-path" d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
              </defs>
              <text>
                <textPath href="#circle-path">СИСТЕМА БАЛЛОВ • POSVYAT • 2026 •</textPath>
              </text>
            </svg>
            <div className="holo-emblem">✦</div>
          </div>

          {/* Имя */}
          <h2 className="text-center fit-flow" style={{ 
            fontSize: 'clamp(14px, 4.5vw, 18px)', 
            fontWeight: 700, 
            color: '#221D5E',
            lineHeight: 1.25,
            maxWidth: '100%'
          }}>
            {user.fullName}
          </h2>

          {/* Моно-чипы */}
          <div className="mono-chips">
            <span className="mono-chip">[ID: {user.id}]</span>
            <span className="mono-chip">[ГРУППА: {user.group}]</span>
            <span className="mono-chip">[{user.points} PTS]</span>
          </div>
        </div>
      </div>

      {/* Группа / Баллы */}
      <NeonReveal>
        <div className="hud-box" style={{ position: 'relative' }}>
          <span className="hud-tag">[SYS://STATS]</span>
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '10px' }}>
            <div className="stat-cell">
              <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginBottom: '6px' }}>Группа</p>
              <p className="fit-nowrap fit-stat-v text-white">{user.group}</p>
            </div>
            <div className="stat-cell" style={{ borderLeft: '1px solid rgba(223,183,239,.25)' }}>
              <p className="fit-nowrap fit-stat-l text-neon-pink" style={{ marginBottom: '6px' }}>Баллы</p>
              <p className="fit-nowrap fit-stat-v text-white">
                <SpeedingText value={user.points} />
              </p>
            </div>
          </div>
        </div>
      </NeonReveal>

      {/* QR-код */}
      <NeonReveal>
        <div className="hud-box" style={{ position: 'relative' }}>
          <span className="hud-tag">[SYS://QR]</span>
          <span className="hud-label fit-flow fit-title">QR-КОД УЧАСТНИКА</span>
          <div className="center-col">
            <div className="qr-frame focus-glow">
              <QRCodeSVG
                value={qrValue}
                level="H"
                includeMargin={false}
                fgColor="#221D5E"
                bgColor="#F5F2FF"
                style={{ width: '100%', height: 'auto', display: 'block', minWidth: '180px' }}
              />
            </div>
            <p className="text-neon-cyan fit-flow fit-cap" style={{ marginTop: '12px' }}>
              Покажите этот код куратору
            </p>
          </div>
        </div>
      </NeonReveal>

      {/* Информация */}
      <NeonReveal>
        <div className="hud-box" style={{ position: 'relative' }}>
          <span className="hud-tag">[SYS://INFO]</span>
          <span className="hud-label fit-flow fit-title">ИНФОРМАЦИЯ</span>
          <AnimatedList style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <AnimatedListItem>
              <div className="kv-row" style={{ padding: '4px 0' }}>
                <span className="k">ФИО</span>
                <div className="v fit-box">
                  <span className="text-white fit-flow" style={{ display: 'block', textAlign: 'right' }}>{user.fullName}</span>
                </div>
              </div>
            </AnimatedListItem>
            <div className="hud-divider"></div>
            <AnimatedListItem>
              <div className="kv-row" style={{ padding: '4px 0' }}>
                <span className="k">Группа</span>
                <div className="v fit-box">
                  <span className="text-white fit-nowrap fit-val" style={{ display: 'block', textAlign: 'right' }}>{user.group}</span>
                </div>
              </div>
            </AnimatedListItem>
            <div className="hud-divider"></div>
            <AnimatedListItem>
              <div className="kv-row" style={{ padding: '4px 0' }}>
                <span className="k">Баллы</span>
                <div className="v fit-box">
                  <span className="text-neon-pink fit-nowrap fit-val" style={{ display: 'block', textAlign: 'right' }}>
                    <SpeedingText value={user.points} />
                  </span>
                </div>
              </div>
            </AnimatedListItem>
            <div className="hud-divider"></div>
            <AnimatedListItem>
              <div className="kv-row" style={{ padding: '4px 0' }}>
                <span className="k">Роль</span>
                <div className="v fit-box" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span className="badge-neon">
                    <span className="fit-nowrap">Участник</span>
                  </span>
                </div>
              </div>
            </AnimatedListItem>
          </AnimatedList>
        </div>
      </NeonReveal>

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <LogOut size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
        <span className="fit-btn-m2">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
