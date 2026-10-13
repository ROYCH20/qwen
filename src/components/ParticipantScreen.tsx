import { QRCodeSVG } from 'qrcode.react';
import { User } from '../database';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ParticipantScreen({ user, onLogout }: Props) {
  const qrValue = JSON.stringify({
    userId: user.id,
    role: user.role,
    type: 'participant_qr'
  });

  return (
    <div className="p-4 pt-10">
      {/* Title */}
      <div className="center-content mb-6">
        <h1 className="text-2xl text-gradient-violet tracking-wider font-bold">Профиль участника</h1>
      </div>

      {/* Profile Card */}
      <div className="card-violet p-4 mb-4">
        <div className="mb-4 text-center">
          <h2 className="text-base text-violet-dark font-semibold tracking-wide">{user.fullName}</h2>
          <p className="text-sm text-violet-muted tracking-wider font-medium">ID: {user.id}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl p-3 text-center" style={{ background: '#ede9fe', border: '1.5px solid #c4b5fd' }}>
            <p className="text-xs text-violet-muted tracking-wider mb-1 font-medium">Группа</p>
            <p className="text-lg text-violet-primary font-bold tracking-wider">{user.group}</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: '#fef3c7', border: '1.5px solid #fcd34d' }}>
            <p className="text-xs tracking-wider mb-1 font-medium" style={{ color: '#92400e' }}>Баллы</p>
            <p className="text-lg font-bold tracking-wider" style={{ color: '#d97706' }}>{user.points}</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="card-violet-accent p-5 mb-4 center-content">
        <h3 className="text-base text-violet-primary font-semibold tracking-wider mb-4">
          QR-код для куратора
        </h3>
        <div className="inline-block rounded-3xl p-4 relative" style={{ background: '#fff', border: '2.5px solid #8b5cf6', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)' }}>
          <QRCodeSVG
            value={qrValue}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#2d1b4e"
            bgColor="#ffffff"
          />
        </div>
        <p className="text-sm text-violet-muted mt-4 tracking-wide font-medium">
          Покажите этот код куратору
        </p>
      </div>

      {/* Info */}
      <div className="card-violet p-4 mb-4">
        <h4 className="text-sm text-violet-primary font-semibold tracking-wider mb-3 text-center">Информация</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1.5px solid #ede9fe' }}>
            <span className="text-xs text-violet-muted tracking-wider font-medium">ФИО:</span>
            <span className="text-xs text-violet-dark tracking-wide font-semibold truncate ml-2">{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1.5px solid #ede9fe' }}>
            <span className="text-xs text-violet-muted tracking-wider font-medium">Группа:</span>
            <span className="text-xs text-violet-dark tracking-wide font-semibold">{user.group}</span>
          </div>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1.5px solid #ede9fe' }}>
            <span className="text-xs text-violet-muted tracking-wider font-medium">Баллы:</span>
            <span className="text-sm text-violet-primary tracking-wider font-bold">{user.points}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-violet-muted tracking-wider font-medium">Роль:</span>
            <span className="badge-violet text-xs">Участник</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="btn-violet btn-violet-dark w-full py-4 text-base tracking-wider shadow-lg mt-6"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
