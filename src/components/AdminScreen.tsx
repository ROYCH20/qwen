import { useState } from 'react';
import { getGroupSummary, getUsersByRole, resetAllPoints, User } from '../database';
import { LogOut, RotateCcw } from 'lucide-react';
import { SignalType, SpeedingText, AnimatedList, AnimatedListItem, NeonReveal } from './animations';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function AdminScreen({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'groups' | 'participants'>('groups');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const groupSummary = getGroupSummary();
  const participants = getUsersByRole('participant');

  const totalPoints = participants.reduce((sum, p) => sum + p.points, 0);
  const totalParticipants = participants.length;

  const handleResetPoints = () => {
    resetAllPoints();
    setShowResetConfirm(false);
    setShowResetSuccess(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setShowResetSuccess(false), 3000);
  };

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title chrome-serif">
          <SignalType>АДМИН</SignalType>
        </h1>
        <p className="fit-flow fit-sub" style={{ marginTop: '4px', color: 'var(--muted)' }}>
          <SignalType>Панель управления</SignalType>
        </p>
      </div>

      {/* Шапка */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft text-center user-name chrome-serif fit-flow" style={{ paddingInline: '16px' }}>
          {user.fullName}
        </h2>
      </div>

      {/* Статистика — таро-рамка */}
      <NeonReveal>
        <div className="hud-box">
          <span className="star-tl">✦</span>
          <span className="star-tr">✦</span>
          <span className="star-bl">✦</span>
          <span className="star-br">✦</span>
          <div key={refreshKey} className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '10px' }}>
            <div className="stat-cell">
              <p className="fit-nowrap fit-stat-v" style={{ color: 'var(--text)' }}>
                <SpeedingText value={totalParticipants} />
              </p>
              <p className="fit-nowrap fit-stat-l" style={{ marginTop: '4px', color: 'var(--muted)' }}>Участников</p>
            </div>
            <div className="stat-cell" style={{ borderLeft: '1px solid var(--hairline)' }}>
              <p className="fit-nowrap fit-stat-v" style={{ color: 'var(--text)' }}>
                <SpeedingText value={groupSummary.length} />
              </p>
              <p className="fit-nowrap fit-stat-l" style={{ marginTop: '4px', color: 'var(--muted)' }}>Групп</p>
            </div>
            <div className="stat-cell" style={{ borderLeft: '1px solid var(--hairline)' }}>
              <p className="fit-nowrap fit-stat-v" style={{ color: 'var(--ir-magenta)' }}>
                <SpeedingText value={totalPoints} />
              </p>
              <p className="fit-nowrap fit-stat-l" style={{ marginTop: '4px', color: 'var(--ir-magenta)' }}>Баллов</p>
            </div>
          </div>
        </div>
      </NeonReveal>

      {/* Кнопка сброса — CTA */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-neon btn-cyan fit-flow"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <RotateCcw size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
        Сбросить баллы всех участников
      </button>

      {/* Тумблеры — глянец-сквирклы */}
      <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', marginTop: 'var(--gap-btn)' }}>
        <button
          onClick={() => setActiveTab('groups')}
          className={`btn-neon ${activeTab === 'groups' ? 'btn-cyan' : 'btn-ghost'}`}
        >
          <span className="fit-nowrap fit-btn2">По группам</span>
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`btn-neon ${activeTab === 'participants' ? 'btn-cyan' : 'btn-ghost'}`}
        >
          <span className="fit-nowrap fit-btn2">Участники</span>
        </button>
      </div>

      {/* Рейтинг групп */}
      {activeTab === 'groups' && (
        <div style={{ marginTop: 'var(--gap-block)' }}>
          <p className="fit-flow fit-stat-l text-center" style={{ marginBottom: '14px', color: 'var(--ir-magenta)' }}>
            Рейтинг академических групп
          </p>
          
          {groupSummary.length === 0 ? (
            <div className="hud-box center-col">
              <span className="star-tl">✦</span>
              <span className="star-tr">✦</span>
              <span className="star-bl">✦</span>
              <span className="star-br">✦</span>
              <p style={{ fontSize: 'clamp(13px, 3.6vw, 15px)', color: 'var(--muted)' }}>Нет данных</p>
            </div>
          ) : (
            <AnimatedList style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-block)' }}>
              {groupSummary.map((item, index) => {
                const maxPoints = groupSummary[0]?.totalPoints || 1;
                const percentage = (item.totalPoints / maxPoints) * 100;
                const colors = ['#FF5CD0', '#A06BFF', '#6FE3EC', '#FFD86B'];
                const color = colors[index] || '#A06BFF';
                
                return (
                  <AnimatedListItem key={item.group}>
                    <div className="hud-box" style={{ marginBottom: 0 }}>
                      <span className="star-tl">✦</span>
                      <span className="star-tr">✦</span>
                      <span className="star-bl">✦</span>
                      <span className="star-br">✦</span>
                      <div className="grp-row" style={{ marginBottom: '10px' }}>
                        <div className="fit-box">
                          <span className="fit-nowrap fit-val" style={{ color, display: 'block' }}>{item.group}</span>
                        </div>
                        <div className="fit-box" style={{ textAlign: 'right' }}>
                          <span className="fit-nowrap fit-val" style={{ color, display: 'block' }}>
                            <SpeedingText value={item.totalPoints} />
                          </span>
                        </div>
                        <span className="fit-flow fit-small" style={{ color: 'var(--muted)' }}>{item.participants} участников</span>
                        <span className="fit-nowrap fit-small" style={{ color: 'var(--muted)' }}>баллов</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}66` }}
                        ></div>
                      </div>
                    </div>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          )}
        </div>
      )}

      {/* Список участников */}
      {activeTab === 'participants' && (
        <div style={{ marginTop: 'var(--gap-block)' }}>
          <p className="fit-flow fit-stat-l text-center" style={{ marginBottom: '14px', color: 'var(--ir-magenta)' }}>
            Все участники
          </p>
          
          <AnimatedList style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-btn)' }}>
            {participants.map((p) => (
              <AnimatedListItem key={p.id}>
                <div className="hud-box list-row" style={{ marginBottom: 0 }}>
                  <span className="star-tl">✦</span>
                  <span className="star-tr">✦</span>
                  <span className="star-bl">✦</span>
                  <span className="star-br">✦</span>
                  <div className="name">
                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>{p.fullName}</p>
                    <p className="fit-nowrap fit-stat-l" style={{ marginTop: '2px', color: 'var(--muted)' }}>
                      {p.group} · {p.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="fit-nowrap fit-stat-v" style={{ color: 'var(--ir-magenta)' }}>
                      <SpeedingText value={p.points} />
                    </p>
                    <p className="fit-nowrap fit-stat-l" style={{ marginTop: '2px', color: 'var(--muted)' }}>
                      баллов
                    </p>
                  </div>
                </div>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        </div>
      )}

      {/* Модальное окно успеха */}
      {showResetSuccess && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', color: 'var(--text)' }}>Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">ОТЛИЧНО</span>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <h3 className="text-center fit-flow fit-sub chrome-serif" style={{ marginBottom: '12px' }}>
              Подтверждение
            </h3>
            <p className="font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', color: 'var(--text)', opacity: 0.8 }}>
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', width: '100%' }}>
              <button onClick={() => setShowResetConfirm(false)} className="btn-neon btn-ghost">
                <span className="fit-nowrap fit-btn2">Отмена</span>
              </button>
              <button onClick={handleResetPoints} className="btn-neon btn-danger">
                <span className="fit-nowrap fit-btn2">Сбросить</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
