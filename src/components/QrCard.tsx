import { QRCodeSVG } from 'qrcode.react';
import { buildUserQr } from '../config';

interface QrCardProps {
  id: string;
  caption: string;
}

export default function QrCard({ id, caption }: QrCardProps) {
  // v17.6: payload НЕ меняется (buildUserQr цел), меняется только СПОСОБ рендера:
  // детерминированная генерация (принципы qrcoder.ru) + CSS-изоляция геометрии.
  const payload = buildUserQr(id);

  return (
    <div className="hud-box">
      <span className="hud-label fit-flow fit-title">QR-КОД</span>
      <div className="center-col">
        <div className="qr-frame focus-glow">
          {/* Фиксированный wrapper 256x256: запрещает flex/grid-искажение
              и растяжение SVG до размера контейнера (потеря четкости модулей) */}
          <div className="qr-stable-wrapper">
            <QRCodeSVG
              value={payload}
              size={256}
              level="L"
              bgColor="#F5F2FF"
              fgColor="#221D5E"
              marginSize={4}
              imageSettings={undefined}
              className="stable-qr-svg"
            />
          </div>
        </div>
        <p className="text-neon-cyan fit-flow fit-cap" style={{ marginTop: '12px' }}>
          {caption}
        </p>
      </div>
    </div>
  );
}
