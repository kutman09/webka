'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Mail, MessageCircle, Phone } from 'lucide-react';
import TextReveal from '@/components/motion/TextReveal';
import Reveal from '@/components/motion/Reveal';
import Button from '@/components/ui/Button';
import ContactForm from '@/components/ui/ContactForm';
import { contactLinks, profile } from '@/data/profile';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './Contact.module.css';

async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

export default function Contact() {
  const { t } = useI18n();
  const [toast, setToast] = useState(null);
  const timer = useRef(0);

  const notify = useCallback((message, tone = 'success') => {
    window.clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const onCopy = async () => {
    try {
      await copyText(profile.email);
      notify(t('contact.copied'));
    } catch {
      notify(t('contact.copyFailed'), 'error');
    }
  };

  const details = [
    { label: t('contact.labels.name'), value: profile.name },
    { label: t('contact.labels.role'), value: t('hero.role') },
    { label: t('contact.labels.location'), value: t('hero.location') },
    { label: t('contact.labels.phone'), value: profile.phoneDisplay, href: contactLinks.phone },
    { label: t('contact.labels.email'), value: profile.email, href: contactLinks.email },
  ];

  return (
    <section id="contact" className={`section ${styles.contact}`} aria-labelledby="contact-title">
      <div className="container">
        <span className="t-label">{t('contact.index')}</span>
        <h2 id="contact-title" className={`t-mega ${styles.title}`}>
          <TextReveal as="span" type="chars" className={styles.titleLine}>
            {t('contact.title1')}
          </TextReveal>
          <TextReveal
            as="span"
            type="chars"
            delay={0.1}
            className={`${styles.titleLine} ${styles.titleAccent}`}
          >
            {t('contact.title2')}
          </TextReveal>
        </h2>

        <div className={styles.layout}>
          <div className={styles.info}>
            <p className={`t-lead ${styles.text}`}>{t('contact.text')}</p>

            <Reveal as="dl" className={styles.details} variant="fade" stagger={0.06}>
              {details.map((item) => (
                <div key={item.label} className={styles.detail} data-reveal>
                  <dt className="t-label">{item.label}</dt>
                  <dd>{item.href ? <a href={item.href}>{item.value}</a> : item.value}</dd>
                </div>
              ))}
            </Reveal>

            <div className={styles.actions}>
              <Button href={contactLinks.whatsapp} external icon={MessageCircle} size="l">
                {t('contact.whatsapp')}
              </Button>
              <Button href={contactLinks.email} variant="ghost" icon={Mail} size="l">
                {t('contact.email')}
              </Button>
              <Button
                variant="ghost"
                icon={Copy}
                size="l"
                onClick={onCopy}
                data-testid="copy-email"
              >
                {t('contact.copy')}
              </Button>
              <Button href={contactLinks.phone} variant="ghost" icon={Phone} size="l">
                {t('contact.call')}
              </Button>
            </div>
          </div>

          <ContactForm notify={notify} />
        </div>
      </div>

      <div className={styles.toastRegion} role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              className={styles.toast}
              data-tone={toast.tone}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <Check size={16} strokeWidth={2} aria-hidden="true" />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
