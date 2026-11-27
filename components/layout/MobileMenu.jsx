'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { NAV_ITEMS } from '@/lib/navigation';
import { contactLinks, profile } from '@/data/profile';
import { useI18n } from '@/providers/LanguageProvider';
import { useSmoothScroll } from '@/providers/SmoothScrollProvider';
import styles from './MobileMenu.module.css';

const EASE = [0.76, 0, 0.24, 1];

const panel = {
  closed: {
    clipPath: 'inset(0% 0% 100% 0%)',
    transition: { duration: 0.55, ease: EASE, delay: 0.1 },
  },
  open: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.65, ease: EASE } },
};

const item = {
  closed: { y: '110%', transition: { duration: 0.3 } },
  open: (index) => ({
    y: '0%',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 + index * 0.06 },
  }),
};

/** Full-screen menu with staggered items, focus trap, Escape to close and scroll lock. */
export default function MobileMenu({ open, onClose, active, goTo }) {
  const { t } = useI18n();
  const { lenis } = useSmoothScroll();
  const ref = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!open) return undefined;
    const scroller = lenis.current;
    scroller?.stop();
    document.documentElement.style.overflow = 'hidden';
    const previous = document.activeElement;
    const focusables = () => ref.current?.querySelectorAll('a, button') ?? [];
    requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const nodes = Array.from(focusables());
      const burger = document.querySelector('[aria-controls="mobile-menu"]');
      const ring = burger ? [...nodes, burger] : nodes;
      const index = ring.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        ring[ring.length - 1].focus();
      } else if (!event.shiftKey && index === ring.length - 1) {
        event.preventDefault();
        ring[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      scroller?.start();
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [open, onClose, lenis]);

  const handleNav = (id, event) => {
    event.preventDefault();
    onClose();
    if (pathname === '/') {
      // wait for the scroll lock to be released before scrolling
      requestAnimationFrame(() => requestAnimationFrame(() => goTo(id)));
    } else {
      router.push(id === 'home' ? '/' : `/#${id}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={ref}
          className={styles.menu}
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.menu')}
          variants={panel}
          initial="closed"
          animate="open"
          exit="closed"
        >
          <nav className={styles.nav} aria-label={t('nav.primary')}>
            <ol>
              {NAV_ITEMS.map((navItem, index) => (
                <li key={navItem.id} className={styles.row}>
                  <motion.a
                    href={navItem.id === 'home' ? '/' : `/#${navItem.id}`}
                    className={styles.link}
                    aria-current={active === navItem.id ? 'true' : undefined}
                    variants={item}
                    custom={index}
                    onClick={(event) => handleNav(navItem.id, event)}
                  >
                    <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                    {t(navItem.key)}
                  </motion.a>
                </li>
              ))}
            </ol>
          </nav>

          <motion.div
            className={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 } }}
            exit={{ opacity: 0 }}
          >
            <LanguageSwitcher layoutId="lang-pill-mobile" />
            <div className={styles.contacts}>
              <a
                href={contactLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" />
              </a>
              <a href={contactLinks.email} aria-label={profile.email}>
                <Mail size={18} strokeWidth={1.6} aria-hidden="true" />
              </a>
              <a href={contactLinks.phone} aria-label={profile.phoneDisplay}>
                <Phone size={18} strokeWidth={1.6} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
