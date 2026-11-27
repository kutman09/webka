'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ScrollProgress from '@/components/motion/ScrollProgress';
import MobileMenu from './MobileMenu';
import { NAV_ITEMS } from '@/lib/navigation';
import { useI18n } from '@/providers/LanguageProvider';
import { useSectionNav } from '@/hooks/useSectionNav';
import styles from './Header.module.css';

export default function Header() {
  const { t } = useI18n();
  const { active, goTo } = useSectionNav();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={styles.header} data-compact={compact} data-menu-open={menuOpen}>
        <div className={`container ${styles.inner}`}>
          <Link
            href="/"
            className={styles.brand}
            onClick={(event) => goTo('home', event)}
            data-cursor="link"
          >
            <span aria-hidden="true">
              <Logo size={38} title="NK" />
            </span>
            <span className={styles.brandText}>
              <span>Nurkalykov</span>
              <span>Kutman</span>
            </span>
          </Link>

          <nav className={styles.nav} aria-label={t('nav.primary')}>
            <ul>
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.id === 'home' ? '/' : `/#${item.id}`}
                      className={styles.link}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={(event) => goTo(item.id, event)}
                      data-cursor="link"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className={styles.activeDot}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {t(item.key)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <LanguageSwitcher className={styles.lang} />
            <Button
              href="/#contact"
              size="s"
              icon={ArrowUpRight}
              className={styles.cta}
              onClick={(event) => goTo('contact', event)}
            >
              {t('nav.letsTalk')}
            </Button>
            <button
              type="button"
              className={styles.burger}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">{menuOpen ? t('nav.close') : t('nav.menu')}</span>
              <span className={styles.burgerLines} aria-hidden="true" />
            </button>
          </div>
        </div>
        <ScrollProgress />
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} goTo={goTo} />
    </>
  );
}
