import { useState } from 'react';
import { getGroupSummary, getUsersByRole, resetAllPoints, User } from '../database';

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

  const isLongName = user.fullName.length > 24;

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">АДМИН</h1>
        <p className="text-neon-cyan screen-subtitle" style={{ marginTop: '4px' }}>Панель управления</p>
      </div>

      {/* Шапка — ВНЕ контейнера */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className={`text-chrome-soft text-center ${isLongName ? 'user-name user-name--long' : 'user-name'}`}>
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>ID: {user.id}</span>
      </div>

      {/* Статистика — ОДИН hud-box с тремя колонками через hud-vdiv */}
      <div className="hud-box">
        <div key={refreshKey} className="flex items-stretch justify-around" style={{ gap: '8px' }}>
          <div className="flex-1 center-col" style={{ padding: '6px 0' }}>
            <p className="stat-value text-white">{totalParticipants}</p>
            <p className="stat-label text-neon-lilac" style={{ marginTop: '4px' }}>Участников</p>
          </div>
          <div className="hud-vdiv"></div>
          <div className="flex-1 center-col" style={{ padding: '6px 0' }}>
            <p className="stat-value text-white">{groupSummary.length}</p>
            <p className="stat-label text-neon-lilac" style={{ marginTop: '4px' }}>Групп</p>
          </div>
          <div className="hud-vdiv"></div>
          <div className="flex-1 center-col" style={{ padding: '6px 0' }}>
            <p className="stat-value text-neon-pink">{totalPoints}</p>
            <p className="stat-label text-neon-pink" style={{ marginTop: '4px' }}>Баллов</p>
          </div>
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-neon btn-danger btn-wide"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        Сбросить баллы всех участников
      </button>

      {/* Тумблер — grid 2 колонки */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', marginTop: 'var(--gap-btn)' }}>
        <button
          onClick={() => setActiveTab('groups')}
          className={`btn-neon btn-grid ${activeTab === 'groups' ? 'btn-cyan' : 'btn-ghost'}`}
        >
          По группам
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`btn-neon btn-grid ${activeTab === 'participants' ? 'btn-cyan' : 'btn-ghost'}`}
        >
          Участники
        </button>
      </div>

      {/* Рейтинг групп */}
      {activeTab === 'groups' && (
        <div style={{ marginTop: 'var(--gap-block)' }}>
          <p className="stat-label text-neon-pink text-center" style={{ marginBottom: '14px' }}>Рейтинг академических групп</p>
          
          {groupSummary.length === 0 ? (
            <div className="hud-box center-col">
              <p className="text-neon-lilac" style={{ fontSize: 'clamp(13px, 3.6vw, 15px)' }}>Нет данных</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-block)' }}>
              {groupSummary.map((item, index) => {
                const maxPoints = groupSummary[0]?.totalPoints || 1;
                const percentage = (item.totalPoints / maxPoints) * 100;
                const colors = ['#F79BE3', '#DFB7EF', '#6FE3EC', '#8E86E4'];
                const color = colors[index] || '#B78FF2';
                
                return (
                  <div key={item.group} className="hud-box" style={{ marginBottom: 0 }}>
                    <div className="flex items-center justify-between" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div className="flex-1 min-w-0">
                        <p className="stat-value text-center" style={{ color }}>{item.group}</p>
                        <p className="stat-label text-neon-lilac text-center" style={{ marginTop: '2px' }}>{item.participants} участников</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="stat-value text-right" style={{ color }}>{item.totalPoints}</p>
                        <p className="stat-label text-neon-lilac text-right" style={{ marginTop: '2px' }}>баллов</p>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}66` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Список участников */}
      {activeTab === 'participants' && (
        <div style={{ marginTop: 'var(--gap-block)' }}>
          <p className="stat-label text-neon-pink text-center" style={{ marginBottom: '14px' }}>Все участники</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-btn)' }}>
            {participants.map((p) => (
              <div key={p.id} className="hud-box flex items-center justify-between" style={{ gap: '12px', marginBottom: 0 }}>
                <div className="flex-1 min-w-0">
                  <p className="user-name text-white">{p.fullName}</p>
                  <p className="stat-label text-neon-lilac" style={{ marginTop: '2px' }}>{p.group} • {p.id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="stat-value text-neon-pink">{p.points}</p>
                  <p className="stat-label text-neon-lilac" style={{ marginTop: '2px' }}>баллов</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно успеха */}
      {showResetSuccess && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-white font-medium text-center" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', lineHeight: 1.3 }}>Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              Отлично
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <h3 className="screen-subtitle text-white font-bold text-center" style={{ marginBottom: '12px' }}>Подтверждение</h3>
            <p className="text-white/80 font-medium text-center" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)', lineHeight: 1.3 }}>
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', width: '100%' }}>
              <button onClick={() => setShowResetConfirm(false)} className="btn-neon btn-ghost btn-grid">
                Отмена
              </button>
              <button onClick={handleResetPoints} className="btn-neon btn-danger btn-grid">
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

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
