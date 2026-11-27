import { Unbounded, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { profile, siteUrl, contactLinks } from '@/data/profile';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SkipLink from '@/components/layout/SkipLink';
import PageTransition from '@/components/motion/PageTransition';
import CustomCursor from '@/components/motion/CustomCursor';

const display = Unbounded({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const title = `${profile.name} — ${profile.role}`;
const description =
  'Personal portfolio of Nurkalykov Kutman, a Full-Stack and AI Developer based in Bishkek, Kyrgyzstan. Explore software engineering, backend development, AI projects, and creative digital experiences.';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s — ${profile.name}` },
  description,
  applicationName: 'NK — Beyond the Code',
  authors: [{ name: profile.name }],
  creator: profile.name,
  keywords: [
    'Nurkalykov Kutman',
    'Full-Stack Developer',
    'AI Developer',
    'Backend Developer',
    'Python',
    'Django',
    'FastAPI',
    'React',
    'Bishkek',
    'Kyrgyzstan',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'NK — Beyond the Code',
    title,
    description,
    locale: 'en_US',
    alternateLocale: ['ru_RU', 'ky_KG'],
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#07080A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  givenName: profile.firstName,
  familyName: profile.lastName,
  jobTitle: profile.role,
  email: contactLinks.email,
  telephone: profile.phone,
  url: siteUrl,
  address: {
    '@type': 'PostalAddress',
    addressLocality: profile.city,
    addressCountry: profile.countryCode,
  },
  knowsAbout: [
    'Software Engineering',
    'Backend Development',
    'Artificial Intelligence',
    'Machine Learning',
    'Web Development',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <LanguageProvider>
          <SmoothScrollProvider>
            <SkipLink />
            <Header />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <CustomCursor />
            <div className="grain" aria-hidden="true" />
          </SmoothScrollProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
