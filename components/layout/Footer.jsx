'use client';

import { ArrowUp } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { NAV_ITEMS } from '@/lib/navigation';
import { contactLinks, profile } from '@/data/profile';
import { useI18n } from '@/providers/LanguageProvider';
import { useSectionNav } from '@/hooks/useSectionNav';
import { useSmoothScroll } from '@/providers/SmoothScrollProvider';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useI18n();
  const { goTo } = useSectionNav();
  const { scrollTo } = useSmoothScroll();
  const year = new Date().getFullYear();
  const marquee = t('footer.marquee');

  return (
    <footer className={styles.footer}>
      <p className="sr-only">{marquee}</p>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track} aria-hidden="true">
          {[0, 1].map((copy) => (
            <span key={copy} className={styles.chunk}>
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={styles.phrase}>
                  {marquee}
                  <span className={styles.star}>✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className={`container ${styles.body}`}>
        <div className={styles.brand}>
          <Logo size={56} />
          <p className={styles.name}>{profile.name}</p>
          <p className="t-label">{t('hero.role')}</p>
        </div>

        <nav className={styles.col} aria-label={t('footer.links')}>
          <p className="t-label">{t('footer.links')}</p>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={item.id === 'home' ? '/' : `/#${item.id}`}
                  onClick={(event) => goTo(item.id, event)}
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <p className="t-label">{t('footer.contact')}</p>
          <ul>
            <li>
              <a href={contactLinks.email}>{profile.email}</a>
            </li>
            <li>
              <a href={contactLinks.phone}>{profile.phoneDisplay}</a>
            </li>
            <li>
              <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li className={styles.muted}>{t('hero.location')}</li>
          </ul>
        </div>

        <button
          type="button"
          className={styles.top}
          onClick={() => scrollTo(0, { focus: false })}
          data-cursor="link"
        >
          <ArrowUp size={18} strokeWidth={1.6} aria-hidden="true" />
          {t('footer.backToTop')}
        </button>
      </div>

      <div className={`container ${styles.legal}`}>
        <span>
          © {year} {profile.name}. {t('footer.rights')}
        </span>
        <span>NK — Beyond the Code</span>
      </div>
    </footer>
  );
}
