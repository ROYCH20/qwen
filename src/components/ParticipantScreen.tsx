import { User } from '../UsersProvider';
import { LogOut } from 'lucide-react';
import { SpeedingText, NeonReveal, SignalType } from './animations';
import QrCard from './QrCard';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ParticipantScreen({ user, onLogout }: Props) {
  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">
          <SignalType>ПРОФИЛЬ</SignalType>
        </h1>
        <p className="text-neon-lilac fit-flow fit-sub" style={{ marginTop: '4px' }}>
          <SignalType>Участник</SignalType>
        </p>
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
                <textPath href="#circle-path">ПОСВЯЩЕНИЕ 2026 • ПОСВЯТ •</textPath>
              </text>
            </svg>
            <div className="holo-emblem">✦</div>
          </div>

          {/* Имя — темный текст на голограмме */}
          <h2 className="text-center fit-flow" style={{ 
            fontSize: 'clamp(14px, 4.5vw, 18px)', 
            fontWeight: 700, 
            color: '#221D5E',
            lineHeight: 1.25,
            maxWidth: '100%'
          }}>
            {user.full_name}
          </h2>
        </div>
      </div>

      {/* Группа / Баллы */}
      <NeonReveal>
        <div className="hud-box">
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '10px' }}>
            <div className="stat-cell">
              <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginBottom: '6px' }}>Группа</p>
              <p className="fit-nowrap fit-stat-v text-white">{user.grp}</p>
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
        <QrCard id={user.id} caption="Покажите этот код куратору" />
      </NeonReveal>

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger bottom-pill"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <LogOut size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
        <span className="fit-btn-m2">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
