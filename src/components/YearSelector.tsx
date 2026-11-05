import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const YEARS = Array.from({ length: 101 }, (_, i) => 2000 + i);

export function YearSelector({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [jumping, setJumping] = useState(false);
  const [jumpVal, setJumpVal] = useState(String(year));
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = YEARS.indexOf(year);
    if (idx >= 0) {
      const target = idx * 68 - el.clientWidth / 2 + 32;
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [year]);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <button onClick={() => scroll(-1)} className="p-1 rounded hover:bg-muted shrink-0" aria-label="prev">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div ref={ref} className="flex gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0 py-1">
        {YEARS.map(y => {
          const future = y > currentYear;
          const active = y === year;
          return (
            <button
              key={y}
              onClick={() => onChange(y)}
              className={[
                'shrink-0 w-16 h-8 rounded-md text-xs font-mono font-semibold transition-all',
                active ? 'bg-primary text-primary-foreground scale-105 shadow' :
                future ? 'bg-accent text-accent-foreground hover:bg-accent/80' :
                'bg-secondary text-secondary-foreground hover:bg-muted',
              ].join(' ')}
            >
              {future && '🔮'} {y}
            </button>
          );
        })}
      </div>
      <button onClick={() => scroll(1)} className="p-1 rounded hover:bg-muted shrink-0" aria-label="next">
        <ChevronRight className="w-4 h-4" />
      </button>
      {jumping ? (
        <input
          autoFocus
          type="number"
          value={jumpVal}
          min={2000}
          max={2100}
          onChange={e => setJumpVal(e.target.value)}
          onBlur={() => {
            const n = parseInt(jumpVal, 10);
            if (n >= 2000 && n <= 2100) onChange(n);
            setJumping(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const n = parseInt(jumpVal, 10);
              if (n >= 2000 && n <= 2100) onChange(n);
              setJumping(false);
            }
          }}
          className="w-20 h-8 px-2 text-xs rounded bg-input border border-border"
        />
      ) : (
        <button onClick={() => { setJumpVal(String(year)); setJumping(true); }} className="px-2 h-8 text-xs rounded bg-secondary hover:bg-muted flex items-center gap-1 shrink-0">
          Jump <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
