'use client';

import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './NotFoundView.module.css';

export default function NotFoundView() {
  const { t } = useI18n();
  return (
    <main id="main" tabIndex={-1} className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <Logo size={64} />
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 className="t-h2">{t('notFound.title')}</h1>
        <p className="t-body">{t('notFound.text')}</p>
        <Button href="/" icon={ArrowLeft}>
          {t('notFound.home')}
        </Button>
      </div>
    </main>
  );
}
