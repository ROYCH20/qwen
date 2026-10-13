import { QRCodeSVG } from 'qrcode.react';
import { User } from '../database';
import { LogOut } from 'lucide-react';
import { CipherText, SpeedingText, AnimatedList, AnimatedListItem, NeonReveal, SignalType, GlimmerWrap } from './animations';

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
        <h1 className="screen-title text-chrome">
          <SignalType>ПРОФИЛЬ</SignalType>
        </h1>
        <p className="text-neon-lilac fit-flow fit-sub" style={{ marginTop: '4px' }}>
          <SignalType>Участник</SignalType>
        </p>
      </div>

      {/* Шапка с Glimmer Wrap */}
      <GlimmerWrap className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft text-center user-name fit-flow">
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>
          <CipherText text={`ID: ${user.id}`} duration={600} />
        </span>
      </GlimmerWrap>

      {/* Группа / Баллы */}
      <NeonReveal>
        <div className="hud-box">
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
        <div className="hud-box">
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
        <div className="hud-box">
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
