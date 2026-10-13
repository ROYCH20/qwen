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
    <div className="p-4 pt-10">
      {/* Title */}
      <div className="center-content mb-6">
        <div className="icon-circle glow-violet mb-3" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6b21a8)' }}>
          <span className="text-white text-3xl">✦</span>
        </div>
        <h1 className="text-2xl text-gradient-violet tracking-wider font-bold">Панель администратора</h1>
      </div>

      {/* Admin Header */}
      <div className="card-violet p-5 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="icon-circle-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6b21a8)' }}>
            <span className="text-white">👑</span>
          </div>
          <div className="text-left">
            <h2 className="text-base text-violet-dark font-semibold tracking-wide">{user.fullName}</h2>
            <p className="text-sm text-violet-muted tracking-wider font-medium">ID: {user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: '#ede9fe', border: '1.5px solid #c4b5fd' }}>
            <p className="text-2xl text-violet-primary font-bold tracking-wider">{totalParticipants}</p>
            <p className="text-xs text-violet-muted tracking-wider font-medium">Участников</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: '#ede9fe', border: '1.5px solid #c4b5fd' }}>
            <p className="text-2xl text-violet-primary font-bold tracking-wider">{groupSummary.length}</p>
            <p className="text-xs text-violet-muted tracking-wider font-medium">Групп</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: '#fef3c7', border: '1.5px solid #fcd34d' }}>
            <p className="text-2xl font-bold tracking-wider" style={{ color: '#d97706' }}>{totalPoints}</p>
            <p className="text-xs tracking-wider font-medium" style={{ color: '#92400e' }}>Баллов</p>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-violet btn-violet-danger w-full py-4 text-base tracking-wider mb-5 font-semibold"
      >
        ✦ Сбросить баллы всех участников ✦
      </button>

      {/* Reset Success Modal */}
      {showResetSuccess && (
        <div className="modal-overlay">
          <div className="card-violet p-6 w-full max-w-sm center-content">
            <div className="icon-circle mb-4" style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' }}>
              <span className="text-white">✓</span>
            </div>
            <p className="text-base text-violet-dark tracking-wide mb-6 font-medium text-center">Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-violet btn-violet-success px-8 py-3 text-base tracking-wider"
            >
              Отлично
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="card-violet p-6 w-full max-w-sm center-content">
            <div className="icon-circle mb-4" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
              <span>⚠</span>
            </div>
            <h3 className="text-lg text-violet-dark tracking-wider mb-3 font-bold">Подтверждение</h3>
            <p className="text-base text-violet-muted tracking-wide mb-6 font-medium text-center">
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-violet btn-violet-secondary py-4 text-base tracking-wider font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleResetPoints}
                className="btn-violet btn-violet-danger py-4 text-base tracking-wider font-semibold"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div key={refreshKey} className="flex rounded-2xl p-1.5 mb-5" style={{ background: '#ede9fe', border: '1.5px solid #c4b5fd' }}>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3.5 text-base tracking-wider rounded-xl transition font-semibold ${
            activeTab === 'groups'
              ? 'btn-violet btn-violet-primary'
              : 'text-violet-muted bg-transparent'
          }`}
        >
          ✦ По группам
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-3.5 text-base tracking-wider rounded-xl transition font-semibold ${
            activeTab === 'participants'
              ? 'btn-violet btn-violet-primary'
              : 'text-violet-muted bg-transparent'
          }`}
        >
          ✦ Участники
        </button>
      </div>

      {/* Group Summary */}
      {activeTab === 'groups' && (
        <div className="space-y-3 mb-6">
          <h3 className="text-base text-violet-primary font-semibold tracking-wider center-content">✧ Рейтинг академических групп ✧</h3>
          
          {groupSummary.length === 0 ? (
            <div className="card-violet p-8 center-content">
              <p className="text-4xl mb-3">✦</p>
              <p className="text-base text-violet-muted tracking-wider font-medium">Нет данных</p>
            </div>
          ) : (
            groupSummary.map((item, index) => {
              const maxPoints = groupSummary[0]?.totalPoints || 1;
              const percentage = (item.totalPoints / maxPoints) * 100;
              const colors = ['#fbbf24', '#9ca3af', '#fb923c', '#8b5cf6'];
              const color = colors[index] || '#a78bfa';
              
              return (
                <div key={item.group} className="card-violet p-4" style={{ borderColor: `${color}66` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{ background: `${color}33`, color, border: `2px solid ${color}66` }}>
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-base font-bold tracking-wider" style={{ color }}>{item.group}</p>
                        <p className="text-sm text-violet-muted tracking-wider font-medium">{item.participants} участников</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold tracking-wider" style={{ color }}>{item.totalPoints}</p>
                      <p className="text-sm text-violet-muted tracking-wider font-medium">баллов</p>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{ background: '#ede9fe' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}66` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Participants List */}
      {activeTab === 'participants' && (
        <div className="space-y-2 mb-6">
          <h3 className="text-base text-violet-primary font-semibold tracking-wider center-content mb-4">✧ Все участники ✧</h3>
          
          {participants.map((p, index) => (
            <div key={p.id} className="card-violet p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#ede9fe', color: '#6b21a8', border: '2px solid #c4b5fd' }}>
                  {index + 1}
                </div>
                <div className="text-left">
                  <p className="text-base text-violet-dark font-semibold tracking-wide">{p.fullName}</p>
                  <p className="text-sm text-violet-muted tracking-wider font-medium">{p.group} • {p.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tracking-wider" style={{ color: '#d97706' }}>{p.points}</p>
                <p className="text-sm tracking-wider font-medium" style={{ color: '#92400e' }}>баллов</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logout button - after tabs content */}
      <button
        onClick={onLogout}
        className="btn-violet btn-violet-dark w-full py-4 text-base tracking-wider shadow-lg mt-6 mb-4 font-semibold"
      >
        ← Выйти из аккаунта
      </button>
    </div>
  );
}
