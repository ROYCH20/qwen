import { useState } from 'react';
import { useUsers, User } from '../UsersProvider';
import { LogOut, RotateCcw, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { SignalType, SpeedingText, AnimatedList, AnimatedListItem, NeonReveal } from './animations';
import { AddUserModal, EditUserModal } from './UserModals';
import confetti from 'canvas-confetti';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function AdminScreen({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'groups' | 'participants'>('groups');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { getGroupSummary, getUsersByRole, resetAllPoints, deleteUser } = useUsers();
  
  const groupSummary = getGroupSummary();
  const participants = getUsersByRole('participant');
  const curators = getUsersByRole('curator');

  const totalPoints = participants.reduce((sum, p) => sum + p.points, 0);
  const totalParticipants = participants.length;

  const handleResetPoints = async () => {
    await resetAllPoints();
    setShowResetConfirm(false);
    setShowResetSuccess(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setShowResetSuccess(false), 3000);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleUserAdded = () => {
    setRefreshKey(k => k + 1);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6C63C9', '#8E86E4', '#B78FF2', '#F79BE3', '#6FE3EC']
    });
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      setDeletingUser(null);
      setRefreshKey(k => k + 1);
    }
  };

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">
          <SignalType>АДМИН</SignalType>
        </h1>
        <p className="text-neon-cyan fit-flow fit-sub" style={{ marginTop: '4px' }}>
          <SignalType>Панель управления</SignalType>
        </p>
      </div>

      {/* Шапка */}
      <div className="center-col" style={{ marginBottom: 'var(--gap-block)' }}>
        <h2 className="text-chrome-soft text-center user-name fit-flow" style={{ paddingInline: '16px' }}>
          {user.full_name}
        </h2>
      </div>

      {/* Статистика */}
      <NeonReveal>
        <div className="hud-box">
          <div key={refreshKey} className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '10px' }}>
            <div className="stat-cell">
              <p className="fit-nowrap fit-stat-v text-white">
                <SpeedingText value={totalParticipants} />
              </p>
              <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '4px' }}>Участников</p>
            </div>
            <div className="stat-cell" style={{ borderLeft: '1px solid rgba(223,183,239,.25)' }}>
              <p className="fit-nowrap fit-stat-v text-white">
                <SpeedingText value={groupSummary.length} />
              </p>
              <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '4px' }}>Групп</p>
            </div>
            <div className="stat-cell" style={{ borderLeft: '1px solid rgba(223,183,239,.25)' }}>
              <p className="fit-nowrap fit-stat-v text-neon-pink">
                <SpeedingText value={totalPoints} />
              </p>
              <p className="fit-nowrap fit-stat-l text-neon-pink" style={{ marginTop: '4px' }}>Баллов</p>
            </div>
          </div>
        </div>
      </NeonReveal>

      {/* Новый пользователь */}
      <NeonReveal>
        <div className="hud-box">
          <span className="hud-label fit-flow fit-title">НОВЫЙ ПОЛЬЗОВАТЕЛЬ</span>
          <button
            onClick={handleAddUser}
            className="btn-neon btn-cyan"
            style={{ width: '100%' }}
          >
            <UserPlus size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
            <span className="fit-btn-m">Добавить пользователя</span>
          </button>
        </div>
      </NeonReveal>

      {/* Кнопка сброса */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="btn-neon btn-danger focus-glow fit-flow"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <RotateCcw size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
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
            <AnimatedList style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-block)' }}>
              {groupSummary.map((item, index) => {
                const maxPoints = groupSummary[0]?.totalPoints || 1;
                const percentage = (item.totalPoints / maxPoints) * 100;
                const colors = ['#F79BE3', '#DFB7EF', '#6FE3EC', '#8E86E4'];
                const color = colors[index] || '#B78FF2';
                
                return (
                  <AnimatedListItem key={item.group}>
                    <div className="hud-box" style={{ marginBottom: 0 }}>
                      <div className="grp-row" style={{ marginBottom: '10px' }}>
                        <div className="fit-box">
                          <span className="fit-nowrap fit-val" style={{ color, display: 'block' }}>{item.group}</span>
                        </div>
                        <div className="fit-box" style={{ textAlign: 'right' }}>
                          <span className="fit-nowrap fit-val" style={{ color, display: 'block' }}>
                            <SpeedingText value={item.totalPoints} />
                          </span>
                        </div>
                        <span className="fit-flow fit-small text-neon-lilac">{item.participants} участников</span>
                        <span className="fit-nowrap fit-small text-neon-lilac">баллов</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}66` }}
                        ></div>
                      </div>
                    </div>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          )}
        </div>
      )}

      {/* Список участников и кураторов */}
      {activeTab === 'participants' && (
        <div style={{ marginTop: 'var(--gap-block)' }}>
          {/* Участники */}
          <div style={{ marginBottom: 'var(--gap-block)' }}>
            <div className="flex items-center justify-center" style={{ gap: '8px', marginBottom: '14px' }}>
              <span style={{ color: '#6FE3EC', fontSize: '16px' }}>✦</span>
              <p className="fit-flow fit-stat-l text-neon-cyan">УЧАСТНИКИ</p>
              <span className="badge-neon" style={{ fontSize: '10px', padding: '2px 8px' }}>
                {participants.length}
              </span>
            </div>
            
            <AnimatedList style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-btn)' }}>
              {participants.map((p) => (
                <AnimatedListItem key={p.id}>
                  <div className="hud-box" style={{ marginBottom: 0 }}>
                    <div className="flex items-center justify-between" style={{ gap: '12px' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-white" style={{ fontWeight: 600, fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{p.full_name}</p>
                        <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '2px' }}>
                          {p.grp} • {p.id} • <span className="text-neon-pink">{p.points} баллов</span>
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={() => setEditingUser(p)}
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <Pencil size={18} strokeWidth={1.5} style={{ color: '#6FE3EC' }} />
                        </button>
                        <button
                          onClick={() => setDeletingUser(p)}
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <Trash2 size={18} strokeWidth={1.5} style={{ color: '#FF5C8A' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </div>

          {/* Разделитель */}
          <div className="soft-divider" style={{ margin: '20px 0' }}></div>

          {/* Кураторы */}
          <div>
            <div className="flex items-center justify-center" style={{ gap: '8px', marginBottom: '14px' }}>
              <span style={{ color: '#F79BE3', fontSize: '16px' }}>✦</span>
              <p className="fit-flow fit-stat-l text-neon-pink">КУРАТОРЫ</p>
              <span className="badge-neon" style={{ fontSize: '10px', padding: '2px 8px' }}>
                {curators.length}
              </span>
            </div>
            
            <AnimatedList style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-btn)' }}>
              {curators.map((c) => (
                <AnimatedListItem key={c.id}>
                  <div className="hud-box" style={{ marginBottom: 0 }}>
                    <div className="flex items-center justify-between" style={{ gap: '12px' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-white" style={{ fontWeight: 600, fontSize: 'clamp(13px, 3.6vw, 15px)' }}>{c.full_name}</p>
                        <p className="fit-nowrap fit-stat-l text-neon-lilac" style={{ marginTop: '2px' }}>
                          {c.id}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={() => setEditingUser(c)}
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <Pencil size={18} strokeWidth={1.5} style={{ color: '#F79BE3' }} />
                        </button>
                        <button
                          onClick={() => setDeletingUser(c)}
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <Trash2 size={18} strokeWidth={1.5} style={{ color: '#FF5C8A' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p className="text-white font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
              Удалить пользователя {deletingUser.full_name} ({deletingUser.id})? Действие необратимо.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                onClick={handleDeleteUser}
                className="btn-neon btn-danger modal-btn"
              >
                Удалить
              </button>
              <button
                onClick={() => setDeletingUser(null)}
                className="btn-neon btn-ghost modal-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно успеха */}
      {showResetSuccess && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p className="text-white font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>Баллы всех участников сброшены до 300!</p>
            <button
              onClick={() => setShowResetSuccess(false)}
              className="btn-neon btn-cyan modal-btn"
            >
              ОТЛИЧНО
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-white font-bold fit-flow fit-sub">
              Подтверждение
            </h3>
            <p className="text-white/80 font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>
              Сбросить баллы всех участников до 300? Это действие нельзя отменить.
            </p>
            <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)', width: '100%' }}>
              <button onClick={() => setShowResetConfirm(false)} className="btn-neon btn-ghost modal-btn">
                Отмена
              </button>
              <button onClick={handleResetPoints} className="btn-neon btn-danger modal-btn">
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления пользователя */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleUserAdded}
        />
      )}

      {/* Модальное окно редактирования пользователя */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            setRefreshKey(k => k + 1);
          }}
        />
      )}

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <LogOut size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
        <span className="fit-btn-m2">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
