import { QRCodeSVG } from 'qrcode.react';

interface QrCardProps {
  id: string;
  caption: string;
}

export default function QrCard({ id, caption }: QrCardProps) {
  return (
    <div className="hud-box">
      <span className="hud-label fit-flow fit-title">QR-КОД</span>
      <div className="center-col">
        <div className="qr-frame focus-glow">
          <QRCodeSVG
            value={id}
            level="H"
            includeMargin={false}
            fgColor="#221D5E"
            bgColor="#F5F2FF"
            style={{ width: '100%', height: 'auto', display: 'block', minWidth: '180px' }}
          />
        </div>
        <p className="text-neon-cyan fit-flow fit-cap" style={{ marginTop: '12px' }}>
          {caption}
        </p>
      </div>
    </div>
  );
}
