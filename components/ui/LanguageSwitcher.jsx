'use client';

import { motion } from 'motion/react';
import { LOCALES, LOCALE_CODES, useI18n } from '@/providers/LanguageProvider';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher({ layoutId = 'lang-pill', className = '' }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className={`${styles.switcher} ${className}`} role="group" aria-label={t('nav.language')}>
      {LOCALE_CODES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            className={styles.option}
            aria-pressed={active}
            aria-label={`${LOCALES[code].meta.short} — ${LOCALES[code].meta.langName}`}
            onClick={() => setLocale(code)}
            data-cursor="link"
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={styles.pill}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className={styles.code}>{LOCALES[code].meta.short}</span>
          </button>
        );
      })}
    </div>
  );
}
