'use client';

import { useId, useState } from 'react';
import { Info, Mail, MessageCircle } from 'lucide-react';
import { contactLinks, profile } from '@/data/profile';
import { interpolate, isValidEmail } from '@/lib/format';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './ContactForm.module.css';

const TYPES = ['website', 'backend', 'fullstack', 'ai', 'collab', 'other'];
const EMPTY = { name: '', email: '', type: 'website', message: '' };

/**
 * No mail backend is connected, so the form never pretends to "send".
 * It validates, composes the message and opens WhatsApp or the visitor's mail
 * app with everything pre-filled — the visitor confirms sending there.
 */
export default function ContactForm({ notify }) {
  const { t } = useI18n();
  const id = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = t('contact.errors.name');
    if (!isValidEmail(values.email)) next.email = t('contact.errors.email');
    if (values.message.trim().length < 10) next.message = t('contact.errors.message');
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(`${id}-${first}`)?.focus();
    return !first;
  };

  const compose = () => {
    const typeLabel = t(`contact.types.${values.type}`);
    const body = [
      interpolate(t('contact.messageIntro'), { name: values.name.trim() }),
      interpolate(t('contact.messageType'), { type: typeLabel }),
      '',
      values.message.trim(),
      '',
      interpolate(t('contact.messageEmail'), { email: values.email.trim() }),
    ].join('\n');
    return { body, subject: interpolate(t('contact.subject'), { type: typeLabel }) };
  };

  const send = (channel) => (event) => {
    event.preventDefault();
    if (!validate()) return;
    const { body, subject } = compose();
    if (channel === 'whatsapp') {
      window.open(
        `${contactLinks.whatsapp}?text=${encodeURIComponent(body)}`,
        '_blank',
        'noopener,noreferrer',
      );
      notify(interpolate(t('contact.opened'), { channel: 'WhatsApp' }));
    } else {
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      notify(interpolate(t('contact.opened'), { channel: 'Email' }));
    }
  };

  const field = (name) => ({
    id: `${id}-${name}`,
    name,
    value: values[name],
    onChange: update(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
  });

  const errorText = (name) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className={styles.error}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={send('whatsapp')}
      aria-labelledby={`${id}-title`}
      data-testid="contact-form"
    >
      <h3 id={`${id}-title`} className={styles.title}>
        {t('contact.formTitle')}
      </h3>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>{t('contact.name')}</label>
          <input type="text" autoComplete="name" required {...field('name')} />
          {errorText('name')}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>{t('contact.emailField')}</label>
          <input type="email" autoComplete="email" inputMode="email" required {...field('email')} />
          {errorText('email')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-type`}>{t('contact.type')}</label>
        <select {...field('type')}>
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`contact.types.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-message`}>{t('contact.message')}</label>
        <textarea rows={5} required {...field('message')} />
        {errorText('message')}
      </div>

      <p className={styles.notice} id={`${id}-notice`}>
        <Info size={16} strokeWidth={1.75} aria-hidden="true" />
        {t('contact.notice')}
      </p>

      <div className={styles.buttons}>
        <button
          type="submit"
          className={styles.primary}
          aria-describedby={`${id}-notice`}
          data-cursor="link"
        >
          <MessageCircle size={17} strokeWidth={1.75} aria-hidden="true" />
          {t('contact.sendWhatsapp')}
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={send('email')}
          aria-describedby={`${id}-notice`}
          data-cursor="link"
        >
          <Mail size={17} strokeWidth={1.75} aria-hidden="true" />
          {t('contact.sendEmail')}
        </button>
      </div>
    </form>
  );
}
