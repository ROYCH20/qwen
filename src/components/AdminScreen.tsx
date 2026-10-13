import { useState } from 'react';
import { getGroupSummary, getUsersByRole, resetAllPoints, User } from '../database';
import FitText from '../FitText';

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
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">
          <FitText lines={1} max={28} min={14}>АДМИН</FitText>
        </h1>
        <p className="text-neon-cyan screen-subtitle" style={{ marginTop: '4px' }}>
          <FitText lines={1} max={15} min={10}>Панель управления</FitText>
        </p>
      </div>

      {/* Шапка — ВНЕ контейнера */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft text-center user-name">
          <FitText lines={1} max={20} min={10}>{user.fullName}</FitText>
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>
          <FitText lines={1} max={13} min={9}>ID: {user.id}</FitText>
        </span>
      </div>

      {/* Статистика — ОДИН hud-box с тремя колонками */}
      <div className="hud-box">
        <div key={refreshKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '10px' }}>
          <div className="center-col" style={{ padding: '6px 6px', minWidth: 0 }}>
            <p className="stat-value text-white">
              <FitText lines={1} max={20} min={12}>{totalParticipants}</FitText>
            </p>
            <p className="stat-label text-neon-lilac" style={{ marginTop: '4px' }}>
              <FitText lines={1} max={12} min={7}>Участников</FitText>
            </p>
          </div>
          <div className="center-col" style={{ padding: '6px 6px', minWidth: 0, borderLeft: '1px solid rgba(223,183,239,.25)' }}>
            <p className="stat-value text-white">
              <FitText lines={1} max={20} min={12}>{groupSummary.length}</FitText>
            </p>
            <p className="stat-label text-neon-lilac" style={{ marginTop: '4px' }}>
              <FitText lines={1} max={12} min={7}>Групп</FitText>
            </p>
          </div>
          <div className="center-col" style={{ padding: '6px 6px', minWidth: 0, borderLeft: '1px solid rgba(223,183,239,.25)' }}>
            <p className="stat-value text-neon-pink">
              <FitText lines={1} max={20} min={12}>{totalPoints}</FitText>
            </p>
            <p className="stat-label text-neon-pink" style={{ marginTop: '4px' }}>
              <FitText lines={1} max={12} min={7}>Баллов</FitText>
            </p>
          </div>
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-neon btn-danger btn-wide"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <FitText lines={2} max={15} min={10}>Сбросить баллы всех участников</FitText>
      </button>

      {/* Тумблер — grid 2 колонки */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', marginTop: 'var(--gap-btn)' }}>
        <button
          onClick={() => setActiveTab('groups')}
          className={`btn-neon btn-grid ${activeTab === 'groups' ? 'btn-cyan' : 'btn-ghost'}`}
          style={{ paddingInline: 'clamp(8px, 2.5vw, 14px)' }}
        >
          <FitText lines={1} max={14} min={8}>По группам</FitText>
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`btn-neon btn-grid ${activeTab === 'participants' ? 'btn-cyan' : 'btn-ghost'}`}
          style={{ paddingInline: 'clamp(8px, 2.5vw, 14px)' }}
        >
          <FitText lines={1} max={14} min={8}>Участники</FitText>
        </button>
      </div>

      {/* Рейтинг групп */}
      {activeTab === 'groups' && (
        <div style={{ marginTop: 'var(--gap-block)' }}>
          <p className="stat-label text-neon-pink text-center" style={{ marginBottom: '14px' }}>
            <FitText lines={1} max={12} min={7}>Рейтинг академических групп</FitText>
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
                        <p className="stat-value text-center" style={{ color }}>
                          <FitText lines={1} max={20} min={12}>{item.group}</FitText>
                        </p>
                        <p className="stat-label text-neon-lilac text-center" style={{ marginTop: '2px' }}>
                          <FitText lines={1} max={12} min={7}>{item.participants} участников</FitText>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="stat-value text-right" style={{ color }}>
                          <FitText lines={1} max={20} min={12}>{item.totalPoints}</FitText>
                        </p>
                        <p className="stat-label text-neon-lilac text-right" style={{ marginTop: '2px' }}>
                          <FitText lines={1} max={12} min={7}>баллов</FitText>
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
          <p className="stat-label text-neon-pink text-center" style={{ marginBottom: '14px' }}>
            <FitText lines={1} max={12} min={7}>Все участники</FitText>
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-btn)' }}>
            {participants.map((p) => (
              <div key={p.id} className="hud-box flex items-center justify-between" style={{ gap: '12px', marginBottom: 0 }}>
                <div className="flex-1 min-w-0">
                  <p className="user-name text-white">
                    <FitText lines={2} max={16} min={11}>{p.fullName}</FitText>
                  </p>
                  <p className="stat-label text-neon-lilac" style={{ marginTop: '2px' }}>
                    <FitText lines={1} max={13} min={9}>{p.group} • {p.id}</FitText>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="stat-value text-neon-pink">
                    <FitText lines={1} max={20} min={12}>{p.points}</FitText>
                  </p>
                  <p className="stat-label text-neon-lilac" style={{ marginTop: '2px' }}>
                    <FitText lines={1} max={12} min={7}>баллов</FitText>
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
            <p className="text-white font-medium text-center text-wrap-balance" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-neon btn-cyan"
              style={{ width: 'auto', paddingInline: '32px' }}
            >
              <FitText lines={1} max={15} min={10}>Отлично</FitText>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <h3 className="screen-subtitle text-white font-bold text-center" style={{ marginBottom: '12px' }}>
              <FitText lines={1} max={15} min={10}>Подтверждение</FitText>
            </h3>
            <p className="text-white/80 font-medium text-center text-wrap-balance" style={{ marginBottom: '24px', fontSize: 'clamp(13px, 3.6vw, 15px)' }}>
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', width: '100%' }}>
              <button onClick={() => setShowResetConfirm(false)} className="btn-neon btn-ghost btn-grid" style={{ paddingInline: 'clamp(8px, 2.5vw, 14px)' }}>
                <FitText lines={1} max={14} min={8}>Отмена</FitText>
              </button>
              <button onClick={handleResetPoints} className="btn-neon btn-danger btn-grid" style={{ paddingInline: 'clamp(8px, 2.5vw, 14px)' }}>
                <FitText lines={1} max={14} min={8}>Сбросить</FitText>
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
        <FitText lines={1} max={15} min={10}>Выйти из аккаунта</FitText>
      </button>
    </div>
  );
}
