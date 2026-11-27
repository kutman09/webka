/**
 * Single source of truth for personal and contact data.
 * Edit here — every section, the footer, SEO metadata and the terminal read from this file.
 */
export const profile = {
  name: 'Nurkalykov Kutman',
  firstName: 'Kutman',
  lastName: 'Nurkalykov',
  initials: 'NK',
  role: 'Full-Stack & AI Developer',
  city: 'Bishkek',
  country: 'Kyrgyzstan',
  countryCode: 'KG',
  timeZone: 'Asia/Bishkek',
  phone: '+996700700070',
  phoneDisplay: '+996 700 700 070',
  email: 'kutmann@gmail.com',
  whatsapp: 'https://wa.me/996700700070',
  // Add a real photo to /public/images and set the path here, e.g. '/images/kutman.jpg'.
  photo: null,
  // Only add profiles that really exist. Empty = nothing is rendered.
  socials: [],
};

export const contactLinks = {
  whatsapp: profile.whatsapp,
  email: `mailto:${profile.email}`,
  phone: `tel:${profile.phone}`,
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);
