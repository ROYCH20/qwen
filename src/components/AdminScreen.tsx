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

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">АДМИН</h1>
        <p className="text-neon-cyan fit-flow fit-sub" style={{ marginTop: '4px' }}>
          Панель управления
        </p>
      </div>

      {/* Шапка */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft text-center user-name fit-flow">
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>
          <span className="fit-nowrap" style={{ fontSize: 'clamp(10px, 3vw, 13px)' }}>ID: {user.id}</span>
        </span>
      </div>

      {/* Статистика */}
      <div className="hud-box">
        <div key={refreshKey} className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '10px' }}>
          <div className="stat-cell">
            <p className="fit-nowrap fit-stat-v text-white">{totalParticipants}</p>
            <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '4px' }}>Участников</p>
          </div>
          <div className="stat-cell" style={{ borderLeft: '1px solid rgba(223,183,239,.25)' }}>
            <p className="fit-nowrap fit-stat-v text-white">{groupSummary.length}</p>
            <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '4px' }}>Групп</p>
          </div>
          <div className="stat-cell" style={{ borderLeft: '1px solid rgba(223,183,239,.25)' }}>
            <p className="fit-nowrap fit-stat-v text-neon-pink">{totalPoints}</p>
            <p className="fit-nowrap fit-stat-l text-neon-pink" style={{ marginTop: '4px' }}>Баллов</p>
          </div>
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-neon btn-danger fit-flow"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        Сбросить баллы всех участников
      </button>

      {/* Тумблер */}
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
          <p className="fit-flow fit-stat-l text-neon-pink text-center" style={{ marginBottom: '14px' }}>
            Рейтинг академических групп
          </p>
          
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
                        <p className="fit-nowrap fit-stat-v text-center" style={{ color }}>
                          {item.group}
                        </p>
                        <p className="fit-nowrap fit-stat-l text-neon-lilac text-center" style={{ marginTop: '2px' }}>
                          {item.participants} участников
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="fit-nowrap fit-stat-v text-right" style={{ color }}>
                          {item.totalPoints}
                        </p>
                        <p className="fit-nowrap fit-stat-l text-neon-lilac text-right" style={{ marginTop: '2px' }}>
                          баллов
                        </p>
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
          <p className="fit-flow fit-stat-l text-neon-pink text-center" style={{ marginBottom: '14px' }}>
            Все участники
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-btn)' }}>
            {participants.map((p) => (
              <div key={p.id} className="hud-box list-row" style={{ marginBottom: 0 }}>
                <div className="name">
                  <p className="text-white" style={{ fontWeight: 600 }}>{p.fullName}</p>
                  <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '2px' }}>
                    {p.group} • {p.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="fit-nowrap fit-stat-v text-neon-pink">{p.points}</p>
                  <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '2px' }}>
                    баллов
                  </p>
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
            <p className="text-white font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <span className="fit-nowrap fit-btn3">Отлично</span>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <h3 className="text-white font-bold text-center fit-flow fit-sub" style={{ marginBottom: '12px' }}>
              Подтверждение
            </h3>
            <p className="text-white/80 font-medium text-center fit-flow" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>
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
