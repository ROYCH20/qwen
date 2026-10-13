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
    <div className="p-4 pt-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl neon-yellow tracking-wider">АДМИН</h1>
        <div className="w-20 h-1 bg-[#ffff00] mx-auto mt-2 shadow-[0_0_10px_#ffff00]"></div>
      </div>

      {/* Admin Header */}
      <div className="card-retro-yellow rounded-none p-4 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 border-l-2 border-b-2 border-[#ffff00]/30"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-r-2 border-t-2 border-[#ffff00]/30"></div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 border-2 border-[#ffff00] flex items-center justify-center text-2xl bg-black/50">
            👑
          </div>
          <div>
            <h2 className="text-base text-[#ffff00] tracking-wide">{user.fullName}</h2>
            <p className="text-[#ffff00]/60 text-sm tracking-wider">ID: {user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="border-2 border-[#ff00ff] p-2 text-center bg-black/30">
            <p className="text-xl text-[#ff00ff] tracking-wider">{totalParticipants}</p>
            <p className="text-[#ff00ff]/60 text-xs tracking-wider">УЧАСТНИКОВ</p>
          </div>
          <div className="border-2 border-[#00ffff] p-2 text-center bg-black/30">
            <p className="text-xl text-[#00ffff] tracking-wider">{groupSummary.length}</p>
            <p className="text-[#00ffff]/60 text-xs tracking-wider">ГРУПП</p>
          </div>
          <div className="border-2 border-[#ffff00] p-2 text-center bg-black/30">
            <p className="text-xl text-[#ffff00] tracking-wider">{totalPoints}</p>
            <p className="text-[#ffff00]/60 text-xs tracking-wider">БАЛЛОВ</p>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-retro btn-retro-red w-full py-4 text-sm tracking-widest mb-4"
      >
        ◄ СБРОСИТЬ БАЛЛЫ ►
      </button>

      {/* Reset Success Modal */}
      {showResetSuccess && (
        <div className="modal-overlay">
          <div className="card-retro rounded-none p-6 w-full max-w-sm text-center" style={{ borderColor: '#39ff14', boxShadow: '0 0 15px rgba(57, 255, 20, 0.3), 4px 4px 0px #000' }}>
            <div className="text-4xl mb-3">✓</div>
            <p className="text-[#39ff14] text-sm tracking-wider mb-4">БАЛЛЫ ВСЕХ УЧАСТНИКОВ СБРОШЕНЫ ДО 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-retro btn-retro-green px-6 py-2 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="card-retro-yellow rounded-none p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">⚠</div>
            <h3 className="text-lg text-[#ffff00] tracking-wider mb-3">ПОДТВЕРЖДЕНИЕ</h3>
            <p className="text-sm text-white/80 tracking-wide mb-5">
              Сбросить баллы всех участников до 300? Действие нельзя отменить.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-retro border-2 border-[#ff00ff]/50 text-[#ff00ff] py-3 text-sm tracking-wider bg-black/30"
              >
                ОТМЕНА
              </button>
              <button
                onClick={handleResetPoints}
                className="btn-retro btn-retro-red py-3 text-sm tracking-wider"
              >
                СБРОС
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div key={refreshKey} className="flex border-2 border-[#ff00ff] mb-4">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 text-sm tracking-wider transition ${
            activeTab === 'groups'
              ? 'bg-[#ff00ff] text-white'
              : 'bg-black/30 text-[#ff00ff]/50'
          }`}
        >
          ◆ ПО ГРУППАМ
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-3 text-sm tracking-wider transition border-l-2 border-[#ff00ff] ${
            activeTab === 'participants'
              ? 'bg-[#ff00ff] text-white'
              : 'bg-black/30 text-[#ff00ff]/50'
          }`}
        >
          ◆ УЧАСТНИКИ
        </button>
      </div>

      {/* Group Summary */}
      {activeTab === 'groups' && (
        <div className="space-y-3">
          <h3 className="text-sm text-[#00ffff] tracking-wider">◆ РЕЙТИНГ ГРУПП ◆</h3>
          
          {groupSummary.length === 0 ? (
            <div className="card-retro rounded-none p-8 text-center">
              <p className="text-4xl mb-2">◆</p>
              <p className="text-sm text-[#ff00ff]/60 tracking-wider">НЕТ ДАННЫХ</p>
            </div>
          ) : (
            groupSummary.map((item, index) => {
              const maxPoints = groupSummary[0]?.totalPoints || 1;
              const percentage = (item.totalPoints / maxPoints) * 100;
              const colors = ['#ffff00', '#c0c0c0', '#ff8c00', '#00ffff'];
              const color = colors[index] || '#ff00ff';
              
              return (
                <div key={item.group} className="card-retro rounded-none p-4" style={{ borderColor: color, boxShadow: `0 0 10px ${color}33, 4px 4px 0px #000` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border-2 flex items-center justify-center text-sm tracking-wider" style={{ borderColor: color, color: color }}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm tracking-wider" style={{ color }}>{item.group}</p>
                        <p className="text-xs text-white/40 tracking-wider">{item.participants} УЧАСТНИКОВ</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl tracking-wider" style={{ color }}>{item.totalPoints}</p>
                      <p className="text-xs text-white/40 tracking-wider">БАЛЛОВ</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-black/50 border border-white/10">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${percentage}%`, background: color, boxShadow: `0 0 8px ${color}` }}
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
          <h3 className="text-sm text-[#00ffff] tracking-wider">◆ ВСЕ УЧАСТНИКИ ◆</h3>
          
          {participants.map((p, index) => (
            <div key={p.id} className="card-retro-cyan rounded-none p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#00ffff] flex items-center justify-center text-xs text-[#00ffff] tracking-wider">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm text-[#00ffff] tracking-wide">{p.fullName}</p>
                  <p className="text-xs text-[#00ffff]/40 tracking-wider">{p.group} • {p.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#ffff00] tracking-wider">{p.points}</p>
                <p className="text-xs text-[#ffff00]/40 tracking-wider">БАЛЛОВ</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
