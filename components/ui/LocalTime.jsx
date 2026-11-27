'use client';

import { useEffect, useState } from 'react';
import { profile } from '@/data/profile';

const formatter =
  typeof Intl !== 'undefined'
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: profile.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : null;

/** Live clock for Bishkek (Asia/Bishkek, GMT+6). Rendered after mount to avoid hydration mismatch. */
export default function LocalTime({ label, className = '', ...rest }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () => setTime(formatter?.format(new Date()) ?? '');
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`t-label ${className}`} {...rest}>
      <span className="local-time-label">{label} — </span>
      <time
        suppressHydrationWarning
        style={{ color: 'var(--c-text)', fontVariantNumeric: 'tabular-nums' }}
      >
        {time ?? '--:--:--'}
      </time>{' '}
      GMT+6
    </span>
  );
}
