import { QRCodeSVG } from 'qrcode.react';
import { User } from '../database';

interface Props {
  user: User;
}

export default function ParticipantScreen({ user }: Props) {
  const qrValue = JSON.stringify({
    userId: user.id,
    role: user.role,
    type: 'participant_qr'
  });

  return (
    <div className="p-4 pt-10">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center soft-glow-sky" style={{ background: 'linear-gradient(135deg, #87ceeb, #a8d8ea)' }}>
          <span className="text-3xl">✿</span>
        </div>
        <h1 className="text-2xl text-gradient-lavender tracking-wider">Участник</h1>
      </div>

      {/* Profile Card */}
      <div className="card-soft-sky p-5 mb-4 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #a8d8ea, #87ceeb)' }}>
            👤
          </div>
          <div>
            <h2 className="text-lg tracking-wide" style={{ color: '#4a3154' }}>{user.fullName}</h2>
            <p className="text-sm tracking-wider" style={{ color: '#5ba3c4' }}>ID: {user.id}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255, 182, 193, 0.2)', border: '1.5px solid rgba(255, 182, 193, 0.4)' }}>
            <p className="text-xs tracking-wider mb-1" style={{ color: '#c47a8a' }}>Группа</p>
            <p className="text-xl tracking-wider" style={{ color: '#ff9ecd' }}>{user.group}</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255, 235, 153, 0.2)', border: '1.5px solid rgba(255, 235, 153, 0.5)' }}>
            <p className="text-xs tracking-wider mb-1" style={{ color: '#b8a44a' }}>Баллы</p>
            <p className="text-xl tracking-wider" style={{ color: '#d4a82f' }}>{user.points} ★</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="card-soft-lavender p-5 mb-4 text-center">
        <h3 className="text-sm tracking-wider mb-4" style={{ color: '#b19cd9' }}>
          ✧ QR-код для куратора ✧
        </h3>
        <div className="inline-block rounded-3xl p-4 relative" style={{ background: '#fff', border: '2.5px solid #c8a2c8', boxShadow: '0 4px 20px rgba(200, 162, 200, 0.3)' }}>
          <QRCodeSVG
            value={qrValue}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#4a3154"
            bgColor="#ffffff"
          />
          {/* Corner decorations */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #ffb6c1, #ff9ecd)' }}></div>
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #ffeb99, #ffd966)' }}></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #87ceeb, #a8d8ea)' }}></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #98fb98, #7fdbca)' }}></div>
        </div>
        <p className="text-xs mt-4 tracking-wide" style={{ color: '#b19cd9' }}>
          ♡ Покажите этот код куратору ♡
        </p>
      </div>

      {/* Info */}
      <div className="card-soft-yellow p-4">
        <h4 className="text-sm tracking-wider mb-3" style={{ color: '#b8a44a' }}>✧ Информация ✧</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid rgba(255, 235, 153, 0.4)' }}>
            <span className="text-xs tracking-wider" style={{ color: '#b8a44a' }}>ФИО:</span>
            <span className="text-xs tracking-wide" style={{ color: '#4a3154' }}>{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid rgba(255, 235, 153, 0.4)' }}>
            <span className="text-xs tracking-wider" style={{ color: '#b8a44a' }}>Группа:</span>
            <span className="text-xs tracking-wide" style={{ color: '#4a3154' }}>{user.group}</span>
          </div>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid rgba(255, 235, 153, 0.4)' }}>
            <span className="text-xs tracking-wider" style={{ color: '#b8a44a' }}>Баллы:</span>
            <span className="text-sm tracking-wider" style={{ color: '#d4a82f' }}>{user.points}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs tracking-wider" style={{ color: '#b8a44a' }}>Роль:</span>
            <span className="text-xs px-3 py-1 rounded-full tracking-wider" style={{ background: 'rgba(135, 206, 235, 0.2)', color: '#5ba3c4', border: '1px solid rgba(135, 206, 235, 0.4)' }}>Участник</span>
          </div>
        </div>
      </div>
    </div>
  );
}
