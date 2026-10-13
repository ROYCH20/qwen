import { useRef, useLayoutEffect, useState, ReactNode } from 'react';

export default function FitText({ 
  children, 
  min = 8, 
  max = 20, 
  step = 0.5,
  className = '' 
}: { 
  children: ReactNode; 
  min?: number; 
  max?: number;
  step?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(max);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      let s = max;
      el.style.fontSize = s + 'px';
      while (s > min && el.scrollWidth > el.clientWidth + 1) {
        s -= step;
        el.style.fontSize = s + 'px';
      }
      setSize(s);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, min, max, step]);

  return (
    <span 
      ref={ref} 
      className={className} 
      style={{ 
        fontSize: size + 'px',
        whiteSpace: 'nowrap',
        display: 'block',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      {children}
    </span>
  );
}
