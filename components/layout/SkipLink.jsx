'use client';

import { useI18n } from '@/providers/LanguageProvider';

export default function SkipLink() {
  const { t } = useI18n();
  return (
    <a className="skip-link" href="#main">
      {t('nav.skip')}
    </a>
  );
}
