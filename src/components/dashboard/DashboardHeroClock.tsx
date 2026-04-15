'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, Sparkles } from 'lucide-react';

const STATUS_MINI: Record<
  'emerald' | 'sky' | 'violet',
  { iconWrap: string; icon: string }
> = {
  emerald: { iconWrap: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  sky: { iconWrap: 'bg-sky-500/10', icon: 'text-sky-400' },
  violet: { iconWrap: 'bg-violet-500/10', icon: 'text-violet-400' },
};

const CARDS = [
  { label: 'Register', value: 'Online', sub: 'Syncing live', icon: Activity, color: 'emerald' as const },
  { label: 'Time', icon: Clock, color: 'sky' as const },
  { label: 'AI Engine', value: 'Active', sub: 'Predictions live', icon: Sparkles, color: 'violet' as const },
];

export default function DashboardHeroClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setTime(new Date());
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid w-full grid-cols-3 gap-2 sm:gap-2.5 lg:w-[240px] lg:grid-cols-1">
      {CARDS.map((card) => {
        const st = STATUS_MINI[card.color];
        const value =
          card.label === 'Time'
            ? time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : card.value;
        const sub =
          card.label === 'Time'
            ? time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
            : card.sub;
        return (
          <div
            key={card.label}
            className="rounded-[10px] sm:rounded-[14px] border border-white/[0.06] bg-white/[0.025] p-2.5 sm:p-3.5 transition-all duration-300 hover:bg-white/[0.04]"
          >
            <div className="mb-1.5 sm:mb-2.5 flex items-center justify-between">
              <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {card.label}
              </span>
              <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg ${st.iconWrap}`}>
                <card.icon size={10} className={`${st.icon} sm:w-3 sm:h-3`} />
              </div>
            </div>
            <p className="text-[11px] sm:text-[13px] font-semibold tabular-nums text-slate-100">{value}</p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-slate-600">{sub}</p>
          </div>
        );
      })}
    </div>
  );
}
