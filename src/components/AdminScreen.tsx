import { useState } from 'react';
import { getGroupSummary, getUsersByRole, resetAllPoints, User } from '../database';

interface Props {
  user: User;
}

export default function AdminScreen({ user }: Props) {
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
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center soft-glow-pink" style={{ background: 'linear-gradient(135deg, #ffeb99, #ffd966)' }}>
          <span className="text-3xl">✿</span>
        </div>
        <h1 className="text-2xl tracking-wider" style={{ background: 'linear-gradient(135deg, #ffd966, #ffb6c1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Админ</h1>
      </div>

      {/* Admin Header */}
      <div className="card-soft-yellow p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #ffeb99, #ffd966)' }}>
            👑
          </div>
          <div>
            <h2 className="text-base tracking-wide" style={{ color: '#4a3154' }}>{user.fullName}</h2>
            <p className="text-sm tracking-wider" style={{ color: '#b8a44a' }}>ID: {user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl p-2 text-center" style={{ background: 'rgba(255, 182, 193, 0.15)', border: '1.5px solid rgba(255, 182, 193, 0.3)' }}>
            <p className="text-xl tracking-wider" style={{ color: '#ff9ecd' }}>{totalParticipants}</p>
            <p className="text-xs tracking-wider" style={{ color: '#c47a8a' }}>Участников</p>
          </div>
          <div className="rounded-2xl p-2 text-center" style={{ background: 'rgba(135, 206, 235, 0.15)', border: '1.5px solid rgba(135, 206, 235, 0.3)' }}>
            <p className="text-xl tracking-wider" style={{ color: '#5ba3c4' }}>{groupSummary.length}</p>
            <p className="text-xs tracking-wider" style={{ color: '#5ba3c4' }}>Групп</p>
          </div>
          <div className="rounded-2xl p-2 text-center" style={{ background: 'rgba(255, 235, 153, 0.15)', border: '1.5px solid rgba(255, 235, 153, 0.4)' }}>
            <p className="text-xl tracking-wider" style={{ color: '#d4a82f' }}>{totalPoints}</p>
            <p className="text-xs tracking-wider" style={{ color: '#b8a44a' }}>Баллов</p>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-soft btn-soft-red w-full py-4 text-sm tracking-wider mb-4"
      >
        ✿ Сбросить баллы ✿
      </button>

      {/* Reset Success Modal */}
      {showResetSuccess && (
        <div className="modal-overlay">
          <div className="card-soft-mint p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #98fb98, #7fdbca)' }}>
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-sm tracking-wide mb-5" style={{ color: '#4a3154' }}>Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-soft btn-soft-mint px-8 py-2.5 text-sm tracking-wider"
            >
              Отлично
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="card-soft-yellow p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffeb99, #ffd966)' }}>
              <span className="text-3xl">⚠</span>
            </div>
            <h3 className="text-lg tracking-wider mb-3" style={{ color: '#4a3154' }}>Подтверждение</h3>
            <p className="text-sm tracking-wide mb-5" style={{ color: '#6b4d7a' }}>
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-soft py-3 text-sm tracking-wider bg-white/50 border-2 border-gray-200"
                style={{ color: '#c8a2c8' }}
              >
                Отмена
              </button>
              <button
                onClick={handleResetPoints}
                className="btn-soft btn-soft-red py-3 text-sm tracking-wider"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div key={refreshKey} className="flex rounded-2xl p-1 mb-4" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1.5px solid rgba(255, 182, 193, 0.3)' }}>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 text-sm tracking-wider rounded-xl transition ${
            activeTab === 'groups'
              ? 'btn-soft btn-soft-pink'
              : 'text-gray-400'
          }`}
        >
          ✿ По группам
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-3 text-sm tracking-wider rounded-xl transition ${
            activeTab === 'participants'
              ? 'btn-soft btn-soft-pink'
              : 'text-gray-400'
          }`}
        >
          ✿ Участники
        </button>
      </div>

      {/* Group Summary */}
      {activeTab === 'groups' && (
        <div className="space-y-3">
          <h3 className="text-sm tracking-wider" style={{ color: '#5ba3c4' }}>✧ Рейтинг групп ✧</h3>
          
          {groupSummary.length === 0 ? (
            <div className="card-soft p-8 text-center">
              <p className="text-4xl mb-2">✿</p>
              <p className="text-sm tracking-wider" style={{ color: '#c8a2c8' }}>Нет данных</p>
            </div>
          ) : (
            groupSummary.map((item, index) => {
              const maxPoints = groupSummary[0]?.totalPoints || 1;
              const percentage = (item.totalPoints / maxPoints) * 100;
              const colors = ['#ffd966', '#c0c0c0', '#ffb366', '#87ceeb'];
              const color = colors[index] || '#ffb6c1';
              
              return (
                <div key={item.group} className="card-soft p-4" style={{ borderColor: `${color}66` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm tracking-wider" style={{ background: `${color}33`, color, border: `1.5px solid ${color}66` }}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm tracking-wider" style={{ color }}>{item.group}</p>
                        <p className="text-xs tracking-wider" style={{ color: '#999' }}>{item.participants} участников</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl tracking-wider" style={{ color }}>{item.totalPoints}</p>
                      <p className="text-xs tracking-wider" style={{ color: '#999' }}>баллов</p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
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
        <div className="space-y-2">
          <h3 className="text-sm tracking-wider" style={{ color: '#5ba3c4' }}>✧ Все участники ✧</h3>
          
          {participants.map((p, index) => (
            <div key={p.id} className="card-soft-sky p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs tracking-wider" style={{ background: 'rgba(135, 206, 235, 0.2)', color: '#5ba3c4', border: '1.5px solid rgba(135, 206, 235, 0.4)' }}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm tracking-wide" style={{ color: '#4a3154' }}>{p.fullName}</p>
                  <p className="text-xs tracking-wider" style={{ color: '#5ba3c4' }}>{p.group} • {p.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm tracking-wider" style={{ color: '#d4a82f' }}>{p.points}</p>
                <p className="text-xs tracking-wider" style={{ color: '#b8a44a' }}>баллов</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
