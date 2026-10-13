import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getUserById, updatePoints, User } from '../database';

interface Props {
  user: User;
}

export default function CuratorScreen({ user }: Props) {
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'credit' | 'debit'>('credit');
  const [points, setPoints] = useState<number | null>(null);
  const [showError, setShowError] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualScan, setManualScan] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-container';

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setShowError('');
    setScannedUser(null);
    
    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanResult(decodedText);
          scanner.stop().catch(() => {});
          setIsScanning(false);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      setShowError('Нет доступа к камере. Используйте ручной ввод ID.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setIsScanning(false);
  };

  const handleScanResult = (data: string) => {
    setShowError('');
    setShowSuccess('');
    setScannedUser(null);
    setPoints(null);

    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type !== 'participant_qr') {
        setShowError('Данный QR-код неверный! QR-код должен принадлежать участнику.');
        return;
      }

      const foundUser = getUserById(parsed.userId);
      if (!foundUser) {
        setShowError(`Пользователь с ID "${parsed.userId}" не найден в системе!`);
        return;
      }

      if (foundUser.role !== 'participant') {
        setShowError('Данный QR-код неверный! Данный QR-код не принадлежит участнику.');
        return;
      }

      setScannedUser(foundUser);
    } catch {
      const foundUser = getUserById(data.trim());
      if (!foundUser) {
        setShowError(`Пользователь с ID "${data.trim()}" не найден в системе!`);
        return;
      }
      if (foundUser.role !== 'participant') {
        setShowError('Данный QR-код неверный! Данный QR-код не принадлежит участнику.');
        return;
      }
      setScannedUser(foundUser);
    }
  };

  const handleManualScan = () => {
    if (!manualScan.trim()) {
      setShowError('Введите ID участника');
      return;
    }
    handleScanResult(manualScan.trim());
  };

  const handleSubmit = () => {
    if (!scannedUser || points === null) {
      setShowError('Выберите количество баллов');
      return;
    }

    if (action === 'debit' && scannedUser.points < points) {
      setShowError(`Недостаточно баллов! У участника только ${scannedUser.points} баллов.`);
      return;
    }

    const newPoints = action === 'credit' 
      ? scannedUser.points + points 
      : scannedUser.points - points;

    const success = updatePoints(scannedUser.id, newPoints);
    if (success) {
      setShowSuccess(
        `${action === 'credit' ? 'ЗАЧИСЛЕНО' : 'СПИСАНО'} ${points} БАЛЛОВ. БАЛАНС: ${newPoints}`
      );
      setShowError('');
      setScannedUser({ ...scannedUser, points: newPoints });
      setPoints(null);
    } else {
      setShowError('Ошибка при обновлении баллов');
    }
  };

  const handleReset = () => {
    setScannedUser(null);
    setPoints(null);
    setShowError('');
    setShowSuccess('');
    setManualScan('');
  };

  return (
    <div className="p-4 pt-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl neon-green tracking-wider">КУРАТОР</h1>
        <div className="w-20 h-1 bg-[#39ff14] mx-auto mt-2 shadow-[0_0_10px_#39ff14]"></div>
      </div>

      {/* Curator Header */}
      <div className="card-retro rounded-none p-4 mb-4 relative" style={{ borderColor: '#39ff14', boxShadow: '0 0 15px rgba(57, 255, 20, 0.3), 4px 4px 0px #000' }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 border-2 border-[#39ff14] flex items-center justify-center text-2xl bg-black/50">
            🎓
          </div>
          <div>
            <h2 className="text-base text-[#39ff14] tracking-wide">{user.fullName}</h2>
            <p className="text-[#39ff14]/60 text-sm tracking-wider">ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="card-retro-cyan rounded-none p-4 mb-4">
        <h3 className="text-sm text-[#00ffff] tracking-wider mb-3">◆ СКАНИРОВАНИЕ QR ◆</h3>
        
        {!isScanning ? (
          <div className="space-y-3">
            <button
              onClick={startScanner}
              className="btn-retro btn-retro-cyan w-full py-3 text-sm tracking-wider"
            >
              ◄ КАМЕРА ►
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#ff00ff]/30"></div>
              <span className="text-xs text-[#ff00ff]/50 tracking-wider">ИЛИ ВВЕДИТЕ ID</span>
              <div className="flex-1 h-px bg-[#ff00ff]/30"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualScan}
                onChange={(e) => { setManualScan(e.target.value); setShowError(''); }}
                placeholder="ID участника (P001)"
                className="input-retro flex-1 px-4 py-3 text-sm"
              />
              <button
                onClick={handleManualScan}
                className="btn-retro btn-retro-green px-4 py-3 text-sm"
              >
                НАЙТИ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div id={scannerContainerId} className="overflow-hidden"></div>
            <button
              onClick={stopScanner}
              className="btn-retro btn-retro-red w-full py-3 text-sm tracking-wider"
            >
              СТОП
            </button>
          </div>
        )}
      </div>

      {/* Error Modal */}
      {showError && (
        <div className="modal-overlay">
          <div className="card-retro-yellow rounded-none p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">⚠</div>
            <p className="text-[#ffff00] text-sm tracking-wider mb-4">{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-retro btn-retro-yellow px-6 py-2 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="card-retro rounded-none p-6 w-full max-w-sm text-center" style={{ borderColor: '#39ff14', boxShadow: '0 0 15px rgba(57, 255, 20, 0.3), 4px 4px 0px #000' }}>
            <div className="text-4xl mb-3">✓</div>
            <p className="text-[#39ff14] text-sm tracking-wider mb-4">{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-retro btn-retro-green px-6 py-2 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Scanned User Info */}
      {scannedUser && (
        <div className="card-retro rounded-none p-4 mb-4">
          <h3 className="text-sm text-[#ff00ff] tracking-wider mb-3">◆ УЧАСТНИК НАЙДЕН ◆</h3>
          <div className="border-2 border-[#00ffff] p-3 bg-black/30 mb-4">
            <p className="text-sm text-[#00ffff] tracking-wide">{scannedUser.fullName}</p>
            <p className="text-xs text-[#00ffff]/60 tracking-wider">Группа: {scannedUser.group} • ID: {scannedUser.id}</p>
            <p className="text-sm text-[#ffff00] tracking-wider mt-1">БАЛАНС: {scannedUser.points} ★</p>
          </div>

          {/* Action Selection */}
          <div className="mb-4">
            <p className="text-xs text-[#ff00ff]/70 tracking-wider mb-2">ДЕЙСТВИЕ:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setAction('credit'); setShowError(''); }}
                className={`py-3 text-sm tracking-wider border-3 transition ${
                  action === 'credit'
                    ? 'btn-retro bg-[#39ff14] text-black'
                    : 'border-2 border-[#39ff14]/30 text-[#39ff14]/50 bg-black/30'
                }`}
                style={{ borderWidth: action === 'credit' ? '3px' : '2px' }}
              >
                + ЗАЧИСЛЕНИЕ
              </button>
              <button
                onClick={() => { setAction('debit'); setShowError(''); }}
                className={`py-3 text-sm tracking-wider border-3 transition ${
                  action === 'debit'
                    ? 'btn-retro bg-[#ff3131] text-white'
                    : 'border-2 border-[#ff3131]/30 text-[#ff3131]/50 bg-black/30'
                }`}
                style={{ borderWidth: action === 'debit' ? '3px' : '2px' }}
              >
                - СПИСАНИЕ
              </button>
            </div>
          </div>

          {/* Points Selection */}
          <div className="mb-4">
            <p className="text-xs text-[#ff00ff]/70 tracking-wider mb-2">КОЛ-ВО БАЛЛОВ:</p>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 150].map(p => (
                <button
                  key={p}
                  onClick={() => { setPoints(p); setShowError(''); }}
                  className={`py-4 text-lg tracking-wider border-3 transition ${
                    points === p
                      ? 'btn-retro bg-[#ffff00] text-black'
                      : 'border-2 border-[#ffff00]/30 text-[#ffff00]/50 bg-black/30'
                  }`}
                  style={{ borderWidth: points === p ? '3px' : '2px' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSubmit}
              disabled={points === null}
              className={`py-3 text-sm tracking-wider border-3 transition ${
                points !== null
                  ? action === 'credit'
                    ? 'btn-retro bg-[#39ff14] text-black'
                    : 'btn-retro bg-[#ff3131] text-white'
                  : 'border-2 border-gray-600 text-gray-600 bg-black/30 cursor-not-allowed'
              }`}
              style={{ borderWidth: points !== null ? '3px' : '2px' }}
            >
              {action === 'credit' ? `+${points || 0}` : `-${points || 0}`}
            </button>
            <button
              onClick={handleReset}
              className="btn-retro border-2 border-[#ff00ff]/50 text-[#ff00ff]/70 py-3 text-sm tracking-wider bg-black/30"
            >
              СБРОС
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
