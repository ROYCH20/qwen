import { useState } from 'react';
import { useUsers, User } from '../UsersProvider';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [id, setId] = useState('');
  const [role, setRole] = useState<'participant' | 'curator'>('participant');
  const [group, setGroup] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; id?: string; group?: string }>({});
  const { addUser } = useUsers();

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    }

    if (!id.trim()) {
      newErrors.id = 'Введите ID';
    }

    if (role === 'participant' && !group.trim()) {
      newErrors.group = 'Для участника обязательна группа';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await addUser({
      id: id.trim(),
      role,
      fullName: fullName.trim(),
      group: role === 'participant' ? group.trim() : undefined
    });

    if (!success) {
      setErrors({ id: 'Такой ID уже существует' });
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="text-white font-bold fit-flow fit-sub">Добавить пользователя</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors({ ...errors, fullName: undefined }); }}
              placeholder="Например: Орлова Ксения Павловна"
              className="input-neon"
            />
            {errors.fullName && (
              <p style={{ fontSize: '10px', color: '#F79BE3', marginTop: '4px' }}>{errors.fullName}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              value={id}
              onChange={(e) => { setId(e.target.value); setErrors({ ...errors, id: undefined }); }}
              placeholder="Например: P009"
              className="input-neon"
            />
            {errors.id && (
              <p style={{ fontSize: '10px', color: '#F79BE3', marginTop: '4px' }}>{errors.id}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
            <button
              onClick={() => setRole('participant')}
              className={`btn-neon ${role === 'participant' ? 'btn-cyan' : 'btn-ghost'}`}
              style={{ paddingInline: '12px' }}
            >
              <span className="fit-nowrap fit-btn3" style={{ letterSpacing: 0 }}>Участник</span>
            </button>
            <button
              onClick={() => setRole('curator')}
              className={`btn-neon ${role === 'curator' ? 'btn-cyan' : 'btn-ghost'}`}
              style={{ paddingInline: '12px' }}
            >
              <span className="fit-nowrap fit-btn3" style={{ letterSpacing: 0 }}>Куратор</span>
            </button>
          </div>

          {role === 'participant' && (
            <div>
              <input
                type="text"
                value={group}
                onChange={(e) => { setGroup(e.target.value); setErrors({ ...errors, group: undefined }); }}
                placeholder="Например: ИВТ-203"
                className="input-neon"
              />
              {errors.group && (
                <p style={{ fontSize: '10px', color: '#F79BE3', marginTop: '4px' }}>{errors.group}</p>
              )}
            </div>
          )}

          <button onClick={handleSubmit} className="btn-neon btn-cyan modal-btn">
            Добавить
          </button>

          <button onClick={onClose} className="btn-neon btn-ghost modal-btn">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [fullName, setFullName] = useState(user.full_name);
  const [id, setId] = useState(user.id);
  const [group, setGroup] = useState(user.grp || '');
  const [errors, setErrors] = useState<{ fullName?: string; id?: string; group?: string }>({});
  const { updateUser } = useUsers();

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    }

    if (!id.trim()) {
      newErrors.id = 'Введите ID';
    }

    if (user.role === 'participant' && !group.trim()) {
      newErrors.group = 'Для участника обязательна группа';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await updateUser(user.id, {
      id: id.trim(),
      fullName: fullName.trim(),
      group: user.role === 'participant' ? group.trim() : undefined
    });

    if (!success) {
      setErrors({ id: 'Такой ID уже занят' });
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="text-white font-bold fit-flow fit-sub">Редактировать пользователя</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors({ ...errors, fullName: undefined }); }}
              placeholder="ФИО"
              className="input-neon"
            />
            {errors.fullName && (
              <p style={{ fontSize: '10px', color: '#F79BE3', marginTop: '4px' }}>{errors.fullName}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              value={id}
              onChange={(e) => { setId(e.target.value); setErrors({ ...errors, id: undefined }); }}
              placeholder="ID"
              className="input-neon"
            />
            {errors.id && (
              <p style={{ fontSize: '10px', color: '#F79BE3', marginTop: '4px' }}>{errors.id}</p>
            )}
          </div>

          {user.role === 'participant' && (
            <div>
              <input
                type="text"
                value={group}
                onChange={(e) => { setGroup(e.target.value); setErrors({ ...errors, group: undefined }); }}
                placeholder="Группа"
                className="input-neon"
              />
              {errors.group && (
                <p style={{ fontSize: '10px', color: '#F79BE3', marginTop: '4px' }}>{errors.group}</p>
              )}
            </div>
          )}

          <button onClick={handleSubmit} className="btn-neon btn-cyan modal-btn">
            Сохранить
          </button>

          <button onClick={onClose} className="btn-neon btn-ghost modal-btn">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
