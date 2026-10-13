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
    <div className="pt-8">
      {/* Заголовок */}
      <div className="center-col mb-6">
        <h1 className="text-2xl text-chrome tracking-wider font-bold">ПРОФИЛЬ</h1>
        <p className="text-sm text-neon-lilac tracking-wider mt-1">Участник</p>
      </div>

      {/* Карточка профиля */}
      <div className="glass-panel-strong mb-4 relative">
        <div className="mb-4 text-center">
          <h2 className="text-base text-white font-semibold tracking-wide truncate">{user.fullName}</h2>
          <p className="text-xs text-neon-cyan tracking-wider font-medium mt-1">ID: {user.id}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(108, 99, 201, 0.2)', border: '1.5px solid rgba(142, 134, 228, 0.4)' }}>
            <p className="text-xs text-neon-lilac tracking-wider mb-1 font-medium">Группа</p>
            <p className="text-lg text-white font-bold tracking-wider">{user.group}</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(247, 155, 227, 0.15)', border: '1.5px solid rgba(247, 155, 227, 0.4)' }}>
            <p className="text-xs text-neon-pink tracking-wider mb-1 font-medium">Баллы</p>
            <p className="text-lg text-white font-bold tracking-wider">{user.points}</p>
          </div>
        </div>
      </div>

      {/* QR-код */}
      <div className="glass-panel mb-4 center-col relative">
        <h3 className="text-sm text-neon-pink font-semibold tracking-wider mb-4 text-center">
          QR-код для куратора
        </h3>
        <div className="inline-block rounded-3xl p-4 relative" style={{ background: '#fff', border: '2px solid rgba(247, 155, 227, 0.6)', boxShadow: '0 0 30px rgba(247, 155, 227, 0.3)' }}>
          <QRCodeSVG
            value={qrValue}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#120F38"
            bgColor="#ffffff"
          />
        </div>
        <p className="text-xs text-neon-cyan mt-4 tracking-wide font-medium text-center">
          Покажите этот код куратору
        </p>
      </div>

      {/* Информация */}
      <div className="glass-panel mb-4 relative">
        <h4 className="text-sm text-neon-lilac font-semibold tracking-wider mb-3 text-center">Информация</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid rgba(223, 183, 239, 0.2)' }}>
            <span className="text-xs text-neon-lilac tracking-wider font-medium">ФИО:</span>
            <span className="text-xs text-white tracking-wide font-semibold truncate ml-2 max-w-[60%]">{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid rgba(223, 183, 239, 0.2)' }}>
            <span className="text-xs text-neon-lilac tracking-wider font-medium">Группа:</span>
            <span className="text-xs text-white tracking-wide font-semibold">{user.group}</span>
          </div>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid rgba(223, 183, 239, 0.2)' }}>
            <span className="text-xs text-neon-lilac tracking-wider font-medium">Баллы:</span>
            <span className="text-sm text-neon-pink tracking-wider font-bold">{user.points}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-neon-lilac tracking-wider font-medium">Роль:</span>
            <span className="badge-neon text-xs">Участник</span>
          </div>
        </div>
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger w-full text-sm tracking-wider"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}
