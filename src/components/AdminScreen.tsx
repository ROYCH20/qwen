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
    <div className="pt-8">
      {/* Заголовок */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="h-screen text-chrome font-bold">АДМИН</h1>
        <p className="text-neon-cyan t-small" style={{ marginTop: '4px', letterSpacing: '0.08em' }}>Панель управления</p>
      </div>

      {/* Карточка админа — имя целиком */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft font-bold text-center h-card" style={{ maxWidth: '100%' }}>
          {user.fullName}
        </h2>
        <span className="badge-neon" style={{ marginTop: '10px' }}>ID: {user.id}</span>
      </div>

      {/* Статистика — panel-glass */}
      <div className="panel-glass">
        <div key={refreshKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
          <div className="center-col" style={{ padding: '10px', background: 'rgba(108, 99, 201, 0.18)', borderRadius: '14px', border: '1px solid rgba(142, 134, 228, 0.35)' }}>
            <p className="h-card text-white font-bold">{totalParticipants}</p>
            <p className="t-small text-neon-lilac font-medium text-center">Участников</p>
          </div>
          <div className="center-col" style={{ padding: '10px', background: 'rgba(108, 99, 201, 0.18)', borderRadius: '14px', border: '1px solid rgba(142, 134, 228, 0.35)' }}>
            <p className="h-card text-white font-bold">{groupSummary.length}</p>
            <p className="t-small text-neon-lilac font-medium text-center">Групп</p>
          </div>
          <div className="center-col" style={{ padding: '10px', background: 'rgba(247, 155, 227, 0.12)', borderRadius: '14px', border: '1px solid rgba(247, 155, 227, 0.35)' }}>
            <p className="h-card text-neon-pink font-bold">{totalPoints}</p>
            <p className="t-small text-neon-pink font-medium text-center">Баллов</p>
          </div>
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-neon btn-danger"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        Сбросить баллы всех участников
      </button>

      {/* Тумблер — grid 2 колонки */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', marginTop: 'var(--gap-btn)' }}>
        <button
          onClick={() => setActiveTab('groups')}
          className={`btn-neon ${activeTab === 'groups' ? 'btn-cyan' : 'btn-ghost'}`}
        >
          По группам
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`btn-neon ${activeTab === 'participants' ? 'btn-cyan' : 'btn-ghost'}`}
        >
          Участники
        </button>
      </div>

      {/* Рейтинг групп */}
      {activeTab === 'groups' && (
        <div style={{ marginTop: 'var(--gap-block)' }}>
          <h3 className="t-label text-neon-pink text-center" style={{ marginBottom: '14px' }}>Рейтинг академических групп</h3>
          
          {groupSummary.length === 0 ? (
            <div className="panel-glass center-col">
              <p className="t-body text-neon-lilac font-medium">Нет данных</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-block)' }}>
              {groupSummary.map((item, index) => {
                const maxPoints = groupSummary[0]?.totalPoints || 1;
                const percentage = (item.totalPoints / maxPoints) * 100;
                const colors = ['#F79BE3', '#DFB7EF', '#6FE3EC', '#8E86E4'];
                const color = colors[index] || '#B78FF2';
                
                return (
                  <div key={item.group} className="panel-glass" style={{ borderColor: `${color}44` }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px', gap: '12px' }}>
                      <div className="flex-1 min-w-0">
                        <p className="h-card font-bold text-center" style={{ color }}>{item.group}</p>
                        <p className="t-small text-neon-lilac font-medium text-center">{item.participants} участников</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="h-card font-bold text-right" style={{ color }}>{item.totalPoints}</p>
                        <p className="t-small text-neon-lilac font-medium text-right">баллов</p>
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
          <h3 className="t-label text-neon-pink text-center" style={{ marginBottom: '14px' }}>Все участники</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {participants.map((p) => (
              <div key={p.id} className="panel-glass flex items-center justify-between" style={{ gap: '12px', marginBottom: 0 }}>
                <div className="flex-1 min-w-0">
                  <p className="h-card text-white font-semibold">{p.fullName}</p>
                  <p className="t-small text-neon-lilac font-medium">{p.group} • {p.id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="h-card text-neon-pink font-bold">{p.points}</p>
                  <p className="t-small text-neon-lilac font-medium">баллов</p>
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
            <p className="t-body text-white font-medium text-center" style={{ marginBottom: '24px' }}>Баллы всех участников сброшены до 300!</p>
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
            <h3 className="h-section text-white font-bold text-center" style={{ marginBottom: '12px' }}>Подтверждение</h3>
            <p className="t-body text-white/80 font-medium text-center" style={{ marginBottom: '24px' }}>
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', width: '100%' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-neon btn-ghost"
              >
                Отмена
              </button>
              <button
                onClick={handleResetPoints}
                className="btn-neon btn-danger"
              >
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
