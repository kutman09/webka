'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import TextReveal from '@/components/motion/TextReveal';
import Reveal from '@/components/motion/Reveal';
import { skillCategories } from '@/data/skills';
import { sceneStore, useSceneValue } from '@/lib/sceneStore';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './Skills.module.css';

/**
 * Desktop: category buttons (a real ARIA tablist) steer the 3D technology universe
 * rendered by the global scene to the right; the panel lists the technologies.
 * Mobile: a light bento grid of all categories — no extra 3D work on phones.
 */
export default function Skills() {
  const { t, pick } = useI18n();
  const active = useSceneValue('activeSkill');
  const tabs = useRef([]);
  const current = skillCategories.find((category) => category.id === active) ?? skillCategories[0];

  const select = (id) => sceneStore.set({ activeSkill: id });

  const onKeyDown = (event, index) => {
    const last = skillCategories.length - 1;
    let next = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
      next = index === last ? 0 : index + 1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    select(skillCategories[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section id="skills" className={`section ${styles.skills}`} aria-labelledby="skills-title">
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.column}>
            <span className="t-label">{t('skills.index')}</span>
            <TextReveal as="h2" id="skills-title" className={`t-h2 ${styles.title}`} type="words">
              {t('skills.title')}
            </TextReveal>
            <p className={`t-body ${styles.intro}`}>{t('skills.intro')}</p>

            {/* Desktop: orbit selector */}
            <div className={styles.universe}>
              <div
                role="tablist"
                aria-label={t('skills.pick')}
                aria-orientation="vertical"
                className={styles.tabs}
              >
                {skillCategories.map((category, index) => {
                  const selected = category.id === active;
                  return (
                    <button
                      key={category.id}
                      ref={(node) => {
                        tabs.current[index] = node;
                      }}
                      id={`skill-tab-${category.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="skill-panel"
                      tabIndex={selected ? 0 : -1}
                      className={styles.tab}
                      onClick={() => select(category.id)}
                      onKeyDown={(event) => onKeyDown(event, index)}
                      data-cursor="link"
                    >
                      {selected && (
                        <motion.span
                          layoutId="skill-tab-bg"
                          className={styles.tabBg}
                          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        />
                      )}
                      <span className={styles.tabIndex}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.tabLabel}>{pick(category.label)}</span>
                      <span className={styles.tabCount}>{category.items.length}</span>
                    </button>
                  );
                })}
              </div>

              <div
                id="skill-panel"
                role="tabpanel"
                aria-labelledby={`skill-tab-${current.id}`}
                className={styles.panel}
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className={styles.panelSummary}>{pick(current.summary)}</p>
                    <ul className={styles.chips}>
                      {current.items.map((item, i) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.04 * i, duration: 0.3 }}
                        >
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                    <p className="t-label">
                      {current.items.length} {t('skills.count')}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet: bento grid */}
        <Reveal as="ul" className={styles.bento} variant="rise" stagger={0.06}>
          {skillCategories.map((category, index) => (
            <li
              key={category.id}
              className={styles.tile}
              data-reveal
              data-wide={index === 0 || index === 2}
            >
              <div className={styles.tileHead}>
                <span className={styles.tabIndex}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.tileTitle}>{pick(category.label)}</h3>
              </div>
              <p className={styles.tileSummary}>{pick(category.summary)}</p>
              <ul className={styles.chips}>
                {category.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
