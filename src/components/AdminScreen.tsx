import { useState } from 'react';
import { getGroupSummary, getUsersByRole, resetAllPoints, User } from '../database';

interface Props {
  user: User;
}

export default function AdminScreen({ user: _user } : Props) {
  const [activeTab, setActiveTab] = useState<'groups' | 'participants'>('groups');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const groupSummary = getGroupSummary();
  const participants = getUsersByRole('participant');

  const totalPoints = participants.reduce((sum, p) => sum + p.points, 0);
  const totalParticipants = participants.length;

  const handleResetPoints = () => {
    resetAllPoints();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="p-4">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-4 mb-4 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <h2 className="text-lg font-bold">{_user.fullName}</h2>
            <p className="text-white/80 text-sm">Администратор • ID: {_user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{totalParticipants}</p>
            <p className="text-white/70 text-xs">Участников</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{groupSummary.length}</p>
            <p className="text-white/70 text-xs">Групп</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-white/70 text-xs">Всего баллов</p>
          </div>
        </div>
      </div>

      {/* Reset Success Message */}
      {resetSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-2 animate-pulse">
          <span className="text-green-500 text-lg">✅</span>
          <p className="text-green-600 text-sm font-medium">Баллы всех участников успешно сброшены до 300!</p>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="w-full bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-4 flex items-center justify-between hover:bg-red-100 transition active:scale-95"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-lg">
            🔄
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">Сбросить баллы</p>
            <p className="text-xs text-red-400">Вернуть всем участникам 300 баллов</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-gray-800">Подтверждение</h3>
              <p className="text-sm text-gray-500 mt-2">
                Вы уверены, что хотите сбросить баллы всех участников до 300? Это действие нельзя отменить.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition active:scale-95"
              >
                Отмена
              </button>
              <button
                onClick={handleResetPoints}
                className="py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition active:scale-95"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div key={refreshKey} className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'groups'
              ? 'bg-white text-[#0077ff] shadow-sm'
              : 'text-gray-500'
          }`}
        >
          📊 По группам
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'participants'
              ? 'bg-white text-[#0077ff] shadow-sm'
              : 'text-gray-500'
          }`}
        >
          👥 Участники
        </button>
      </div>

      {/* Group Summary */}
      {activeTab === 'groups' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Рейтинг академических групп</h3>
          
          {groupSummary.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-sm">Нет данных</p>
            </div>
          ) : (
            groupSummary.map((item, index) => {
              const maxPoints = groupSummary[0]?.totalPoints || 1;
              const percentage = (item.totalPoints / maxPoints) * 100;
              
              return (
                <div key={item.group} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-50 text-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.group}</p>
                        <p className="text-xs text-gray-400">{item.participants} участников</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0077ff]">{item.totalPoints}</p>
                      <p className="text-xs text-gray-400">баллов</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-yellow-400' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-400' :
                        'bg-[#0077ff]'
                      }`}
                      style={{ width: `${percentage}%` }}
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
          <h3 className="text-sm font-semibold text-gray-700">Все участники</h3>
          
          {participants.map((p, index) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-500">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.fullName}</p>
                  <p className="text-xs text-gray-400">{p.group} • ID: {p.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#0077ff]">{p.points}</p>
                <p className="text-xs text-gray-400">баллов</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
