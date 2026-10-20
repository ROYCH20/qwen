import { useState } from 'react';
import confetti from 'canvas-confetti';
import { useUsers, User } from '../UsersProvider';
import { parseQrPayload } from '../qrPayload';
import { LogOut, ScanLine } from 'lucide-react';
import { SignalType, AnimatedList, AnimatedListItem, NeonReveal, SpeedingText } from './animations';
import QrCard from './QrCard';
import ScannerOverlay from '../ScannerOverlay';
import ErrorModal from '../ErrorModal';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function CuratorScreen({ user, onLogout }: Props) {
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'credit' | 'debit'>('credit');
  const [points, setPoints] = useState<number | null>(null);
  const [showError, setShowError] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [errorKind, setErrorKind] = useState<'denied' | 'unavailable' | 'invalid' | 'timeout' | null>(null);
  const { getUserById, updatePoints, resetUserPoints } = useUsers();

  // Валидатор куратора — той же формы, что вход: сырой decode -> валидный id или null.
  // Именно parseQrPayload чинит дефект чтения QR из личного кабинета: куратор
  // распознает диплинк …?qr=P001, который генерирует QrCard участника
  // (плюс голый id — обратная совместимость).
  const validateCurator = (raw: string) => {
    const id = parseQrPayload(raw);
    return id && getUserById(id) ? id : null;
  };

  // Поток открытия карточки/панели начисления-списания баллов для отсканированного id.
  const openParticipantForPoints = (id: string) => {
    setShowError('');
    setShowSuccess('');
    setPoints(null);

    const foundUser = getUserById(id);
    if (!foundUser || foundUser.role !== 'participant') {
      setErrorKind('invalid');
      return;
    }

    setScannedUser(foundUser);
  };

  const handleSubmit = async () => {
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

    const success = await updatePoints(scannedUser.id, newPoints);
    if (success) {
      setShowSuccess(
        `${action === 'credit' ? 'Зачислено' : 'Списано'} ${points} баллов. Новый баланс: ${newPoints}`
      );
      setShowError('');
      setScannedUser({ ...scannedUser, points: newPoints });
      setPoints(null);
      // Confetti на успех — цвета палитры (как в AdminScreen)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6C63C9', '#8E86E4', '#B78FF2', '#F79BE3', '#6FE3EC']
      });
    } else {
      setShowError('Ошибка при обновлении баллов');
    }
  };

  // Основная кнопка действия в карточке «УЧАСТНИК НАЙДЕН» (v17.6):
  // единственная крупная пилюля — применяет выбранный режим (Зачисление/
  // Списание) и количество из пилюль (updatePoints выбранного участника).
  const handleApplyAction = () => {
    if (!scannedUser || points === null) {
      setShowError('Выберите количество баллов');
      return;
    }
    handleSubmit();
  };

  // v17.6: точечный сброс баланса КОНКРЕТНОГО найденного участника к базовым
  // 300 (resetUserPoints), НЕ админский сброс всей базы (resetAllPoints не тронут).
  const handleResetUser = async () => {
    if (!scannedUser) return;

    const success = await resetUserPoints(scannedUser.id);
    if (success) {
      setScannedUser({ ...scannedUser, points: 300 });
      setShowSuccess(`Баланс участника ${scannedUser.full_name} сброшен к базовым 300`);
      setShowError('');
      setPoints(null);
    } else {
      setShowError('Ошибка при сбросе баллов участника');
    }
  };


  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Заголовок */}
      <div className="center-col screen-head" style={{ marginBottom: 'var(--gap-title)' }}>
        <h1 className="screen-title text-chrome">
          <SignalType>КУРАТОР</SignalType>
        </h1>
        <p className="text-neon-cyan fit-flow fit-sub" style={{ marginTop: '4px' }}>
          <SignalType>Панель управления</SignalType>
        </p>
      </div>

      {/* Holo-card */}
      <div className="holo-card">
        <div className="holo-card-inner center-col" style={{ paddingInline: '16px' }}>
          {/* 3D-хром-эмблема */}
          <div className="holo-emblem-wrap">
            <svg className="holo-circle-text" viewBox="0 0 120 120">
              <defs>
                <path id="circle-path" d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
              </defs>
              <text>
                <textPath href="#circle-path">ПОСВЯЩЕНИЕ 2026 • ПОСВЯТ •</textPath>
              </text>
            </svg>
            <div className="holo-emblem">✦</div>
          </div>

          {/* Имя — темный текст на голограмме */}
          <h2 className="text-center fit-flow" style={{ 
            fontSize: 'clamp(14px, 4.5vw, 18px)', 
            fontWeight: 700, 
            color: '#221D5E',
            lineHeight: 1.25,
            maxWidth: '100%'
          }}>
            {user.full_name}
          </h2>
        </div>
      </div>

      {/* QR-код куратора */}
      <NeonReveal>
        <QrCard id={user.id} caption="Ваш QR для входа в систему" />
      </NeonReveal>

      {/* Сканирование */}
      <NeonReveal>
        <div className="hud-box">
          <span className="hud-label fit-flow fit-title">СКАНИРОВАНИЕ QR-КОДА</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              onClick={() => { setScannerOpen(true); setShowError(''); }}
              className="btn-scan"
            >
              <ScanLine size={18} strokeWidth={1.5} />
              <span className="fit-btn-m">Сканировать участника</span>
            </button>
            <p style={{ fontSize: '10px', color: '#B9B0E6', textAlign: 'center', lineHeight: 1.3 }}>
              Отсканируйте QR-код участника — баллы начисляются или списываются отсканированному участнику
            </p>
          </div>
        </div>
      </NeonReveal>

      {/* Оверлей сканера (единый ScannerOverlay, как во входе) */}
      {scannerOpen && (
        <ScannerOverlay
          validate={validateCurator}
          onResult={(id) => {
            setScannerOpen(false);
            openParticipantForPoints(id);
          }}
          onError={(kind) => {
            setScannerOpen(false);
            setErrorKind(kind);
          }}
          onCancel={() => setScannerOpen(false)}
        />
      )}

      {/* Единая модалка ошибок (те же kind-тексты v17.3) */}
      <ErrorModal
        kind={errorKind}
        onRetry={() => {
          setErrorKind(null);
          setScannerOpen(true);
        }}
        onClose={() => setErrorKind(null)}
      />

      {/* Информация о найденном участнике */}
      {scannedUser && (
        <NeonReveal>
          <div className="hud-box">
            <span className="hud-label fit-flow fit-title">УЧАСТНИК НАЙДЕН</span>
            
            <div className="center-col" style={{ padding: '10px 0', marginBottom: '10px' }}>
              <p className="user-name text-white text-center fit-flow">{scannedUser.full_name}</p>
              <p className="fit-flow fit-sub text-neon-lilac" style={{ marginTop: '4px' }}>
                Группа: {scannedUser.grp} • ID: {scannedUser.id}
              </p>
              <p className="fit-nowrap fit-stat-v text-neon-cyan" style={{ marginTop: '8px' }}>
                Баланс: <SpeedingText value={scannedUser.points} />
              </p>
            </div>

            <div className="hud-divider"></div>

            {/* Действие */}
            <div style={{ marginTop: '10px', marginBottom: '14px' }}>
              <p className="fit-nowrap fit-stat-l text-neon-lilac text-center" style={{ marginBottom: '10px' }}>
                Действие
              </p>
              <div className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
                <button
                  onClick={() => { setAction('credit'); setShowError(''); }}
                  className={`btn-neon ${action === 'credit' ? 'btn-cyan' : 'btn-ghost'}`}
                >
                  <span className="fit-nowrap fit-btn2">Зачисление</span>
                </button>
                <button
                  onClick={() => { setAction('debit'); setShowError(''); }}
                  className={`btn-neon ${action === 'debit' ? 'btn-danger' : 'btn-ghost'}`}
                >
                  <span className="fit-nowrap fit-btn2">Списание</span>
                </button>
              </div>
            </div>

            {/* Количество баллов */}
            <div style={{ marginBottom: '14px' }}>
              <p className="fit-flow fit-stat-l text-neon-lilac text-center" style={{ marginBottom: '10px' }}>
                Количество баллов
              </p>
              <AnimatedList className="btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--gap-btn)' }}>
                {[50, 100, 150].map(p => (
                  <AnimatedListItem key={p}>
                    <button
                      onClick={() => { setPoints(p); setShowError(''); }}
                      className={`btn-neon ${points === p ? 'btn-chrome' : 'btn-ghost'}`}
                      style={{ fontWeight: 700 }}
                    >
                      <span className="fit-nowrap fit-stat-v">{p}</span>
                    </button>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </div>

            <div style={{ height: 'var(--gap-block)' }}></div>

            {/* v17.6: ЕДИНСТВЕННАЯ основная кнопка действия на всю ширину
                (мелкая нижняя дублирующая пилюля «+{amount}» удалена).
                Класс переключается по режиму: Зачисление -> btn-action-full +
                btn-scan (бирюзово-розовый градиент), Списание -> + btn-scan-danger
                (розово-красный danger-градиент). */}
            <button
              onClick={handleApplyAction}
              disabled={points === null}
              className={`btn-action-full btn-scan ${action === 'debit' ? 'btn-scan-danger' : ''}`}
            >
              <span className="fit-btn-m">
                {action === 'credit' ? `Начислить +${points || 0}` : `Списать -${points || 0}`}
              </span>
            </button>

            {/* v17.6: «Сброс» поднят до размера основной кнопки и переехал вниз
                панели (последний элемент блока действий): secondary-стиль —
                прозрачный фон, тонкая рамка, без свечения. */}
            <button
              onClick={handleResetUser}
              className="btn-action-full btn-action-secondary"
              style={{ marginTop: '12px' }}
            >
              <span className="fit-btn-m">Сброс</span>
            </button>
          </div>
        </NeonReveal>
      )}

      {/* Модальное окно ошибки */}
      {showError && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p className="text-white font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="btn-neon btn-pink modal-btn"
            >
              ПОНЯТНО
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно успеха */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p className="text-white font-medium fit-flow" style={{ fontSize: 'clamp(12px, 3.6vw, 15px)', lineHeight: 1.35 }}>{showSuccess}</p>
            <button
              onClick={() => setShowSuccess('')}
              className="btn-neon btn-cyan modal-btn"
            >
              ОТЛИЧНО
            </button>
          </div>
        </div>
      )}

      {/* Кнопка выхода */}
      <button
        onClick={onLogout}
        className="btn-neon btn-danger bottom-pill"
        style={{ marginTop: 'var(--gap-block)' }}
      >
        <LogOut size={18} strokeWidth={1.5} style={{ marginRight: '8px' }} />
        <span className="fit-btn-m2">Выйти из аккаунта</span>
      </button>
    </div>
  );
}
