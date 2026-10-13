import { useRef, useLayoutEffect, ReactNode } from 'react';

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

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const fit = () => {
      const cs = getComputedStyle(parent);
      const avail = parent.clientWidth
        - parseFloat(cs.paddingLeft)
        - parseFloat(cs.paddingRight);
      
      let s = max;
      el.style.fontSize = s + 'px';
      
      while (s > min && el.scrollWidth > avail + 1) {
        s -= step;
        el.style.fontSize = s + 'px';
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    
    return () => ro.disconnect();
  }, [children, min, max, step]);

  return (
    <span 
      ref={ref} 
      className={className}
      style={{ 
        display: 'inline-block',
        maxWidth: '100%',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </span>
  );
}
