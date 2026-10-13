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
    <div className="p-4 pt-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl neon-cyan tracking-wider">УЧАСТНИК</h1>
        <div className="w-20 h-1 bg-[#00ffff] mx-auto mt-2 shadow-[0_0_10px_#00ffff]"></div>
      </div>

      {/* Profile Card */}
      <div className="card-retro-cyan rounded-none p-5 mb-4 relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 border-l-2 border-b-2 border-[#00ffff]/30"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-r-2 border-t-2 border-[#00ffff]/30"></div>
        
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 border-3 border-[#00ffff] flex items-center justify-center text-3xl bg-black/50" style={{ borderWidth: '3px' }}>
            👤
          </div>
          <div>
            <h2 className="text-lg text-[#00ffff] tracking-wide">{user.fullName}</h2>
            <p className="text-[#ff00ff] text-sm tracking-wider">ID: {user.id}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-[#ff00ff] p-3 bg-black/30">
            <p className="text-[#ff00ff]/70 text-xs tracking-wider mb-1">ГРУППА</p>
            <p className="text-xl text-[#ff00ff] tracking-wider">{user.group}</p>
          </div>
          <div className="border-2 border-[#ffff00] p-3 bg-black/30">
            <p className="text-[#ffff00]/70 text-xs tracking-wider mb-1">БАЛЛЫ</p>
            <p className="text-xl text-[#ffff00] tracking-wider">{user.points} ★</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="card-retro rounded-none p-5 mb-4 text-center">
        <h3 className="text-sm text-[#ff00ff] tracking-wider mb-4">
          ◆ QR-КОД ДЛЯ КУРАТОРА ◆
        </h3>
        <div className="inline-block border-3 border-[#ff00ff] p-3 bg-white relative" style={{ borderWidth: '3px' }}>
          <QRCodeSVG
            value={qrValue}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#1a0533"
            bgColor="#ffffff"
          />
          {/* Corner decorations */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#ffff00]"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffff00]"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#ffff00]"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#ffff00]"></div>
        </div>
        <p className="text-xs text-[#00ffff]/60 mt-4 tracking-wider">
          ▸ ПОКАЖИТЕ ЭТОТ КОД КУРАТОРУ ◂
        </p>
      </div>

      {/* Info */}
      <div className="card-retro-yellow rounded-none p-4">
        <h4 className="text-sm text-[#ffff00] tracking-wider mb-3">◆ ИНФОРМАЦИЯ ◆</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#ffff00]/20 pb-2">
            <span className="text-xs text-[#ffff00]/60 tracking-wider">ФИО:</span>
            <span className="text-xs text-white tracking-wide">{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#ffff00]/20 pb-2">
            <span className="text-xs text-[#ffff00]/60 tracking-wider">ГРУППА:</span>
            <span className="text-xs text-white tracking-wide">{user.group}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#ffff00]/20 pb-2">
            <span className="text-xs text-[#ffff00]/60 tracking-wider">БАЛЛЫ:</span>
            <span className="text-sm text-[#ffff00] tracking-wider">{user.points}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#ffff00]/60 tracking-wider">РОЛЬ:</span>
            <span className="text-xs text-[#00ffff] border border-[#00ffff] px-2 py-0.5 tracking-wider">УЧАСТНИК</span>
          </div>
        </div>
      </div>
    </div>
  );
}
