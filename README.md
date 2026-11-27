# NK — Beyond the Code

Interactive 3D portfolio of **Nurkalykov Kutman**, Full-Stack & AI Developer (Bishkek, Kyrgyzstan).

A single, continuous WebGL "film" runs behind the page: the **Intelligence Core** (a procedural chrome
cage, interlaced rings and an energy core) dives, opens up and recedes as you scroll, then turns into the
**NK nucleus of a technology universe** in the Skills section. All text stays real HTML: accessible,
translatable and indexable.

- 3 languages: English · Русский · Кыргызча
- Desktop horizontal case gallery; vertical gallery on mobile and with reduced motion
- Interactive Lab: neural network visualisation (WebGL), particle field (Canvas 2D), sandboxed terminal
- Automatic quality tiers (high / medium / low / static) with a CSS/SVG fallback when WebGL is missing
  or not GPU-accelerated

---

## Tech stack

| Area      | Libraries                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, JavaScript (`.js` / `.jsx`)                                  |
| 3D        | three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing + postprocessing, custom GLSL |
| Motion    | GSAP + ScrollTrigger + SplitText (via @gsap/react), Motion for React, Lenis                                |
| UI        | CSS Modules + CSS custom properties, next/font (Unbounded, Manrope, JetBrains Mono), lucide-react          |
| Quality   | ESLint (eslint-config-next), Prettier, Playwright                                                          |

How the motion work is split, so two engines never animate the same property:

- **GSAP**: scroll timelines, pinning, text reveals, preloader, page transitions
- **Motion**: component-level micro-interactions (magnetic buttons, active-nav pill, menu, tabs, toasts, card tilt)
- **Lenis**: the only smooth-scroll engine, driven by the GSAP ticker and synced with ScrollTrigger
- **React Three Fiber**: everything inside the canvases (`useFrame`)

## Architecture

```
app/
  layout.jsx            fonts, metadata, JSON-LD Person, providers, header/footer
  page.jsx              home: preloader, fixed 3D stage, sections
  projects/[slug]/      static case pages (generateStaticParams)
  sitemap.js robots.js opengraph-image.jsx twitter-image.jsx icon.svg not-found.jsx
components/
  layout/               Header, MobileMenu, Footer, SkipLink
  sections/             Hero, About, Projects, Skills, Experience, Playground (Lab), Contact, ProjectDetail
  three/                Scene (single global canvas), SceneMount (quality + scroll director),
                        IntelligenceCore, ParticleField, SkillsUniverse, CameraController,
                        NeuralNetwork, SceneFallback
  lab/                  LabExperiments, NeuralLab, ParticleLab, RangeControl
  motion/               Preloader, TextReveal, Reveal, MagneticButton, ScrollProgress,
                        PageTransition, TransitionLink, CustomCursor
  ui/                   Button, Logo, ProjectCard, ProjectVisual, LanguageSwitcher,
                        ContactForm, Terminal, LocalTime
data/                   profile.js, projects.js, skills.js, experience.js   ← edit content here
locales/                en.json, ru.json, ky.json                          ← UI strings
lib/                    sceneTimeline.js (3D art direction), sceneStore.js, gsap.js,
                        nkMark.js (logo geometry), terminalCommands.js, navigation.js
hooks/                  useDevicePerformance, useReducedMotion, useMediaQuery, useMousePosition, useSectionNav
providers/              LanguageProvider, SmoothScrollProvider
shaders/particles.js    GLSL for particles, energy core and neural links
styles/                 tokens.css (design tokens), typography.css, animations.css
tests/                  Playwright specs
```

Server Components are used for routes and metadata. Interactive pieces are Client Components.
three.js is code-split and only loads on the client, after hydration, when WebGL is available.

## Getting started

Requirements: Node.js ≥ 20.9 and npm.

```bash
npm install
npm run dev          # http://localhost:3000 (Next picks the next free port if 3000 is busy)
```

Production:

```bash
npm run build
npm run start        # serves the production build
```

Quality checks:

```bash
npm run lint
npm run format       # Prettier
npx playwright install chromium   # first time only
npm test             # builds, starts on :3100 and runs the Playwright suite
CAPTURE=1 npx playwright test tests/screenshots.spec.js --project=desktop   # review screenshots → ./screenshots
```

Set `PLAYWRIGHT_BASE_URL=http://localhost:3000` to run the tests against a server that is already running.

## Editing content

### Contact details

`data/profile.js` is the single source of truth (name, role, phone, email, WhatsApp, city, time zone).
Header, contact section, footer, terminal, SEO metadata and JSON-LD all read from it.
Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://example.com`) before deploying so canonical URLs, the sitemap
and Open Graph use the real domain.

### Projects

Add an object to `data/projects.js`:

```js
{
  slug: 'my-project',            // URL: /projects/my-project
  number: '07',
  title: 'My Project',
  visual: 'ai',                  // procedural artwork: commerce | otp | social | delivery | culture | ai
  image: '/images/my-project.webp', // optional real screenshot (replaces the artwork)
  status: 'completed',           // personal | in-progress | completed | live
  category: { en: '…', ru: '…', ky: '…' },
  tech: ['Python', 'FastAPI'],
  description: { en: '…', ru: '…', ky: '…' },
  focus: { en: ['…'], ru: ['…'], ky: ['…'] },
  links: { github: 'https://github.com/…', live: null }, // null hides the button
}
```

The project descriptions are editable drafts. Every project is marked "Personal project", and no
GitHub or demo links are set. Add real links and statuses only when they are confirmed.

### Experience

`data/experience.js`: every milestone has `date: null` and `highlights: null`. Fill in real dates and
achievements; empty fields are not rendered.

### Real photo

Put the photo in `public/images/` (WebP or AVIF recommended) and set
`photo: '/images/your-photo.webp'` in `data/profile.js`. The About section switches from the abstract
NK composition to the photo automatically (served through `next/image`).

### Colours and fonts

- Colours, spacing, radii, motion timings and layer order: `styles/tokens.css`
  (`--c-accent` is the acid green; keep it as a controlled accent).
- Fonts: `app/layout.jsx` (next/font). All three families include Cyrillic and Cyrillic-ext,
  so Kyrgyz letters such as ң, ө, ү are supported.

### 3D scenes

- **Scroll art direction**: `lib/sceneTimeline.js` has one keyframe per section (desktop and mobile):
  core position, scale, ring spread, NK morph, particle morph, universe visibility, stage opacity.
- **Quality tiers**: `QUALITY_PRESETS` in `hooks/useDevicePerformance.js`. Force a tier with
  `?quality=high|medium|low|static`. At runtime, `PerformanceMonitor` lowers DPR and, if needed, the tier.
- **Bloom** strength and threshold: `components/three/Scene.jsx`.
- **Shaders**: `shaders/particles.js`.

### Languages

UI strings live in `locales/*.json`. Data strings use `{ en, ru, ky }` objects.
To add a language, add `locales/xx.json`, register it in `providers/LanguageProvider.jsx` (`LOCALES`),
and add the `xx` field to the data objects. The choice is saved in `localStorage`, and `<html lang>` follows it.

## Accessibility and motion

- Semantic landmarks, skip link, visible focus, keyboard-operable menu (focus trap and Escape),
  ARIA tablist for skills, labelled form with inline errors
- `prefers-reduced-motion`: no Lenis, no pinning or parallax, no auto-rotation or cursor effects,
  instant text, short fades
- The contact form never fakes a send. It composes the message and opens WhatsApp or the visitor's mail
  app, and the visitor confirms there.
- The terminal runs only an allow-list of commands (`lib/terminalCommands.js`); nothing reaches the OS
  or the network.

## Libraries and licences

| Package                                                                   | Licence                                                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| next, react, react-dom                                                    | MIT                                                                                               |
| three, @react-three/fiber, @react-three/drei, @react-three/postprocessing | MIT                                                                                               |
| postprocessing                                                            | Zlib                                                                                              |
| gsap, @gsap/react (incl. ScrollTrigger, SplitText)                        | GSAP Standard "no charge" licence: free for commercial use, see https://gsap.com/standard-license |
| motion                                                                    | MIT                                                                                               |
| lenis                                                                     | MIT                                                                                               |
| lucide-react                                                              | ISC                                                                                               |
| Unbounded, Manrope, JetBrains Mono (Google Fonts via next/font)           | SIL Open Font License 1.1                                                                         |

All imagery is original: the project artworks are procedural SVG and the 3D scene is procedural geometry.
There are no stock images, third-party models or HDR downloads (lighting uses drei `Lightformer`s).
