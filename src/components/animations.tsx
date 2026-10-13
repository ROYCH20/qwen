import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════
// CipherText — декод ID
// ═══════════════════════════════════════════
interface CipherTextProps {
  text: string;
  duration?: number;
  charset?: string;
  className?: string;
}

export function CipherText({ text, duration = 600, charset = '01#%&@$', className = '' }: CipherTextProps) {
  const [display, setDisplay] = useState(text);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    setDisplay(text.split('').map(() => charset[Math.floor(Math.random() * charset.length)]).join(''));
    
    const step = duration / text.length;
    let current = 0;
    
    const interval = setInterval(() => {
      current++;
      setRevealed(current);
      
      if (current >= text.length) {
        clearInterval(interval);
        setDisplay(text);
      } else {
        const scrambled = text.split('').map((char, i) => 
          i < current ? char : charset[Math.floor(Math.random() * charset.length)]
        ).join('');
        setDisplay(scrambled);
      }
    }, step);
    
    return () => clearInterval(interval);
  }, [text, duration, charset]);

  return <span className={className}>{display}</span>;
}

// ═══════════════════════════════════════════
// SpeedingText — прокрутка цифр
// ═══════════════════════════════════════════
interface SpeedingTextProps {
  value: string | number;
  className?: string;
}

export function SpeedingText({ value, className = '' }: SpeedingTextProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className={className}
        style={{ display: 'inline-block' }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════
// AnimatedList — построчное появление
// ═══════════════════════════════════════════
interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className = '', style }: AnimatedListProps & { style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } }
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] } }
      }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// NeonReveal — раскрытие рамки
// ═══════════════════════════════════════════
interface NeonRevealProps {
  children: ReactNode;
  className?: string;
}

export function NeonReveal({ children, className = '' }: NeonRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0.3 }}
      animate={{ clipPath: 'inset(0)', opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// SignalType — неоновое разжигание
// ═══════════════════════════════════════════
interface SignalTypeProps {
  children: ReactNode;
  className?: string;
}

export function SignalType({ children, className = '' }: SignalTypeProps) {
  return (
    <motion.span
      className={`signal-type ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.span>
  );
}

// ═══════════════════════════════════════════
// GlimmerWrap — Y2K-искры
// ═══════════════════════════════════════════
interface GlimmerWrapProps {
  children: ReactNode;
  className?: string;
}

export function GlimmerWrap({ children, className = '', style }: GlimmerWrapProps & { style?: React.CSSProperties }) {
  const sparks = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${i * 0.34}s`,
    color: i % 2 === 0 ? '#DFB7EF' : '#6FE3EC',
    size: `${8 + Math.random() * 4}px`
  }));

  return (
    <div className={`relative ${className}`} style={{ display: 'inline-block', ...style }}>
      {children}
      {sparks.map(spark => (
        <span
          key={spark.id}
          className="glimmer-spark"
          style={{
            top: spark.top,
            left: spark.left,
            animationDelay: spark.delay,
            color: spark.color,
            fontSize: spark.size
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// BlinkingSquares — живые звёзды
// ═══════════════════════════════════════════
export function BlinkingSquares() {
  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random()}s`
  }));

  return (
    <>
      {stars.map(star => (
        <div
          key={star.id}
          className="twinkle-star"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}
        />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════
// Preloader — CRT-включение
// ═══════════════════════════════════════════
export function Preloader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      style={{ background: '#000' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.15, delay: 0.45 }}
    >
      <div
        className="preloader-line"
        style={{
          width: '60%',
          height: '2px',
          background: '#fff',
          transformOrigin: 'center'
        }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// PerspectiveGrid — уходящая к горизонту сетка
// ═══════════════════════════════════════════
export function PerspectiveGrid() {
  return <div className="perspective-grid" />;
}

// ═══════════════════════════════════════════
// FilmGrain + Vignette — плёночные эффекты
// ═══════════════════════════════════════════
export function FilmGrain() {
  return <div className="film-grain" />;
}

export function Vignette() {
  return <div className="vignette" />;
}
