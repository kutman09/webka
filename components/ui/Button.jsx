import MagneticButton from '@/components/motion/MagneticButton';
import TransitionLink from '@/components/motion/TransitionLink';
import styles from './Button.module.css';

/**
 * Button / link with the site's visual language.
 *  variant: 'primary' | 'ghost' | 'text'
 *  href starting with '/' (no hash) uses the page transition; external links open safely.
 */
export default function Button({
  href,
  variant = 'primary',
  size = 'm',
  icon: Icon,
  children,
  className = '',
  magnetic = true,
  external = false,
  cursor = 'link',
  ...rest
}) {
  const classes = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;
  const content = (
    <>
      <span className={styles.label}>
        <span className={styles.labelInner}>{children}</span>
        {typeof children === 'string' && (
          <span className={styles.labelClone} aria-hidden="true">
            {children}
          </span>
        )}
      </span>
      {Icon && (
        <span className={styles.icon} aria-hidden="true">
          <Icon size={16} strokeWidth={1.75} />
        </span>
      )}
    </>
  );

  let element;
  if (href && href.startsWith('/') && !href.includes('#')) {
    element = (
      <TransitionLink href={href} className={classes} data-cursor={cursor} {...rest}>
        {content}
      </TransitionLink>
    );
  } else if (href) {
    element = (
      <a
        href={href}
        className={classes}
        data-cursor={cursor}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  } else {
    element = (
      <button type="button" className={classes} data-cursor={cursor} {...rest}>
        {content}
      </button>
    );
  }

  return magnetic ? <MagneticButton>{element}</MagneticButton> : element;
}
