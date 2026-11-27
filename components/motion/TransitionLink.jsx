'use client';

import Link from 'next/link';
import { usePageTransition } from './PageTransition';

/** next/link that plays the page transition for plain left-clicks. */
export default function TransitionLink({ href, onClick, children, ...rest }) {
  const { navigate } = usePageTransition();

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
