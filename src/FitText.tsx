import { useRef, useLayoutEffect, useState, CSSProperties, ReactNode } from 'react';

export default function FitText({ 
  children, 
  min = 8, 
  max = 20, 
  step = 0.5,
  lines = 1,
  className = '' 
}: { 
  children: ReactNode; 
  min?: number; 
  max?: number;
  step?: number;
  lines?: 1 | 2;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ fontSize: max });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const fit = () => {
      const parent = el.parentElement;
      if (!parent) return;

      const cs = getComputedStyle(parent);
      const avail = parent.clientWidth - parseFloat(cs.paddingLeft || '0')
        - parseFloat(cs.paddingRight || '0');

      let s = max;
      
      if (lines === 1) {
        el.style.whiteSpace = 'nowrap';
        el.style.fontSize = s + 'px';
        while (s > min && el.scrollWidth > avail + 1) {
          s -= step;
          el.style.fontSize = s + 'px';
        }
      } else {
        el.style.whiteSpace = 'normal';
        (el.style as CSSProperties & { textWrap?: string }).textWrap = 'balance';
        el.style.fontSize = s + 'px';
        const used = () => Math.round(el.scrollHeight / (parseFloat(el.style.fontSize) * 1.25));
        while (s > min && used() > lines) {
          s -= step;
          el.style.fontSize = s + 'px';
        }
      }

      setStyle({
        fontSize: parseFloat(el.style.fontSize),
        whiteSpace: el.style.whiteSpace as CSSProperties['whiteSpace']
      });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    fit();

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    window.addEventListener('resize', schedule);

    const fonts = document.fonts as FontFaceSet | undefined;
    fonts?.ready.then(schedule);
    fonts?.addEventListener?.('loadingdone', schedule);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      fonts?.removeEventListener?.('loadingdone', schedule);
    };
  }, [children, min, max, step, lines]);

  return (
    <span 
      ref={ref} 
      className={className}
      style={{ 
        ...style, 
        display: 'block', 
        width: '100%', 
        maxWidth: '100%',
        overflow: 'hidden',
        lineHeight: 1.25
      }}
    >
      {children}
    </span>
  );
}
