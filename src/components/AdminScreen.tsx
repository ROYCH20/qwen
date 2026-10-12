import { useState } from 'react';
import { getGroupSummary, getUsersByRole, User } from '../database';

interface Props {
  user: User;
}

export default function AdminScreen({ user: _user } : Props) {
  const [activeTab, setActiveTab] = useState<'groups' | 'participants'>('groups');
  const groupSummary = getGroupSummary();
  const participants = getUsersByRole('participant');

  const totalPoints = participants.reduce((sum, p) => sum + p.points, 0);
  const totalParticipants = participants.length;

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

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
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
