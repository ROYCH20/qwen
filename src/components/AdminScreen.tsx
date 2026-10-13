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
      <div className="center-col mb-6">
        <h1 className="text-2xl text-chrome tracking-wider font-bold">АДМИН</h1>
        <p className="text-sm text-neon-cyan tracking-wider mt-1">Панель управления</p>
      </div>

      {/* Карточка админа */}
      <div className="glass-panel-strong mb-4 relative">
        <div className="mb-4 text-center">
          <h2 className="text-sm text-white font-semibold tracking-wide truncate">{user.fullName}</h2>
          <p className="text-xs text-neon-lilac tracking-wider font-medium mt-1">ID: {user.id}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl p-2 text-center" style={{ background: 'rgba(108, 99, 201, 0.2)', border: '1.5px solid rgba(142, 134, 228, 0.4)' }}>
            <p className="text-xl text-white font-bold tracking-wider">{totalParticipants}</p>
            <p className="text-xs text-neon-lilac tracking-wider font-medium">Участников</p>
          </div>
          <div className="rounded-2xl p-2 text-center" style={{ background: 'rgba(108, 99, 201, 0.2)', border: '1.5px solid rgba(142, 134, 228, 0.4)' }}>
            <p className="text-xl text-white font-bold tracking-wider">{groupSummary.length}</p>
            <p className="text-xs text-neon-lilac tracking-wider font-medium">Групп</p>
          </div>
          <div className="rounded-2xl p-2 text-center" style={{ background: 'rgba(247, 155, 227, 0.15)', border: '1.5px solid rgba(247, 155, 227, 0.4)' }}>
            <p className="text-xl text-neon-pink font-bold tracking-wider">{totalPoints}</p>
            <p className="text-xs text-neon-pink tracking-wider font-medium">Баллов</p>
          </div>
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-neon btn-danger w-full text-sm tracking-wider mb-4"
      >
        Сбросить баллы всех участников
      </button>

      {/* Модальное окно успеха */}
      {showResetSuccess && (
        <div className="modal-overlay">
          <div className="modal-card center-col">
            <p className="text-base text-white tracking-wide mb-6 font-medium text-center">Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-neon btn-cyan px-8 text-sm tracking-wider"
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
            <h3 className="text-lg text-white tracking-wider mb-3 font-bold">Подтверждение</h3>
            <p className="text-sm text-white/80 tracking-wide mb-6 font-medium text-center">
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-neon btn-ghost text-sm tracking-wider"
              >
                Отмена
              </button>
              <button
                onClick={handleResetPoints}
                className="btn-neon btn-danger text-sm tracking-wider"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Табы */}
      <div key={refreshKey} className="flex rounded-full p-1 mb-4" style={{ background: 'rgba(108, 99, 201, 0.2)', border: '1.5px solid rgba(142, 134, 228, 0.3)' }}>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 text-sm tracking-wider rounded-full transition font-semibold ${
            activeTab === 'groups'
              ? 'btn-neon btn-cyan'
              : 'text-neon-lilac bg-transparent'
          }`}
        >
          По группам
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-3 text-sm tracking-wider rounded-full transition font-semibold ${
            activeTab === 'participants'
              ? 'btn-neon btn-cyan'
              : 'text-neon-lilac bg-transparent'
          }`}
        >
          Участники
        </button>
      </div>

      {/* Рейтинг групп */}
      {activeTab === 'groups' && (
        <div className="space-y-3 mb-4">
          <h3 className="text-sm text-neon-pink font-semibold tracking-wider text-center">Рейтинг академических групп</h3>
          
          {groupSummary.length === 0 ? (
            <div className="glass-panel center-col">
              <p className="text-sm text-neon-lilac tracking-wider font-medium">Нет данных</p>
            </div>
          ) : (
            groupSummary.map((item, index) => {
              const maxPoints = groupSummary[0]?.totalPoints || 1;
              const percentage = (item.totalPoints / maxPoints) * 100;
              const colors = ['#F79BE3', '#DFB7EF', '#6FE3EC', '#8E86E4'];
              const color = colors[index] || '#B78FF2';
              
              return (
                <div key={item.group} className="glass-panel relative" style={{ borderColor: `${color}44` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold tracking-wider text-center" style={{ color }}>{item.group}</p>
                      <p className="text-xs text-neon-lilac tracking-wider font-medium text-center">{item.participants} участников</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold tracking-wider" style={{ color }}>{item.totalPoints}</p>
                      <p className="text-xs text-neon-lilac tracking-wider font-medium">баллов</p>
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
            })
          )}
        </div>
      )}

      {/* Список участников */}
      {activeTab === 'participants' && (
        <div className="space-y-2 mb-4">
          <h3 className="text-sm text-neon-pink font-semibold tracking-wider text-center mb-3">Все участники</h3>
          
          {participants.map((p) => (
            <div key={p.id} className="glass-panel flex items-center justify-between gap-2 relative">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold tracking-wide truncate">{p.fullName}</p>
                <p className="text-xs text-neon-lilac tracking-wider font-medium">{p.group} • {p.id}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg text-neon-pink font-bold tracking-wider">{p.points}</p>
                <p className="text-xs text-neon-lilac tracking-wider font-medium">баллов</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger w-full text-sm tracking-wider mt-4"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
