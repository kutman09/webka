'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SECTION_ORDER } from '@/lib/navigation';
import { useSmoothScroll } from '@/providers/SmoothScrollProvider';

/** Active section tracking + in-page navigation that also works from sub-pages. */
export function useSectionNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollTo } = useSmoothScroll();
  const [active, setActive] = useState('home');
  const onHome = pathname === '/';

  useEffect(() => {
    if (!onHome) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(entry.target.id === 'lab' ? 'experience' : entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    SECTION_ORDER.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [onHome]);

  const goTo = useCallback(
    (id, event) => {
      if (event && (event.metaKey || event.ctrlKey || event.shiftKey)) return;
      event?.preventDefault();
      if (!onHome) {
        router.push(id === 'home' ? '/' : `/#${id}`);
        return;
      }
      if (id === 'home') scrollTo(0, { focus: false });
      else scrollTo(`#${id}`);
      window.history.replaceState(null, '', id === 'home' ? '/' : `/#${id}`);
    },
    [onHome, router, scrollTo],
  );

  return { active: onHome ? active : null, goTo, onHome };
}
