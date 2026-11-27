import Preloader from '@/components/motion/Preloader';
import SceneMount from '@/components/three/SceneMount';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Experience from '@/components/sections/Experience';
import Playground from '@/components/sections/Playground';
import Contact from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <>
      <noscript>
        <style>{'[data-preloader]{display:none!important}'}</style>
      </noscript>
      <Preloader />
      <SceneMount />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Playground />
        <Contact />
      </main>
    </>
  );
}
