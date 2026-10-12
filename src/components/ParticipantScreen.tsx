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
    <div className="p-4">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#0077ff] to-[#0055cc] rounded-2xl p-5 mb-4 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.fullName}</h2>
            <p className="text-white/80 text-sm">ID: {user.id}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-white/70 text-xs mb-1">Группа</p>
            <p className="text-lg font-bold">{user.group}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-white/70 text-xs mb-1">Баллы</p>
            <p className="text-lg font-bold">{user.points} ⭐</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <h3 className="text-center text-sm font-semibold text-gray-700 mb-4">
          Ваш QR-код для куратора
        </h3>
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#0077ff"
            />
          </div>
        </div>
        <p className="text-center text-xs text-gray-400">
          Покажите этот QR-код куратору для начисления/списания баллов
        </p>
      </div>

      {/* Info */}
      <div className="bg-[#f5f5f7] rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Информация</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">ФИО:</span>
            <span className="text-xs font-medium text-gray-800">{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Академическая группа:</span>
            <span className="text-xs font-medium text-gray-800">{user.group}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Баланс баллов:</span>
            <span className="text-xs font-bold text-[#0077ff]">{user.points}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Роль:</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Участник</span>
          </div>
        </div>
      </div>
    </div>
  );
}
