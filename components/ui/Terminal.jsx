'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { completeCommand, runCommand } from '@/lib/terminalCommands';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './Terminal.module.css';

const PROMPT = 'visitor@nk:~$';
const WELCOME = [
  { text: 'NK OS — sandboxed developer terminal', tone: 'accent' },
  { text: 'Type "help" to list commands. Tab completes, ↑ ↓ browse history.', tone: 'muted' },
];

const normalise = (line) => (typeof line === 'string' ? { text: line } : line);

/** Interactive terminal backed by an allow-list of commands (lib/terminalCommands.js). */
export default function Terminal() {
  const { t } = useI18n();
  const inputId = useId();
  const [lines, setLines] = useState(WELCOME);
  const [value, setValue] = useState('');
  const history = useRef([]);
  const cursor = useRef(-1);
  const screen = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    if (screen.current) screen.current.scrollTop = screen.current.scrollHeight;
  }, [lines]);

  const submit = (event) => {
    event.preventDefault();
    const command = value;
    setValue('');
    cursor.current = -1;
    if (command.trim()) history.current = [command, ...history.current].slice(0, 30);
    const output = runCommand(command);
    if (output === 'CLEAR') {
      setLines([]);
      return;
    }
    setLines((previous) =>
      [
        ...previous,
        { text: `${PROMPT} ${command}`, tone: 'prompt' },
        ...output.map(normalise),
      ].slice(-200),
    );
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowUp' && history.current.length) {
      event.preventDefault();
      cursor.current = Math.min(cursor.current + 1, history.current.length - 1);
      setValue(history.current[cursor.current]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      cursor.current = Math.max(cursor.current - 1, -1);
      setValue(cursor.current === -1 ? '' : history.current[cursor.current]);
    } else if (event.key === 'Tab') {
      const completion = completeCommand(value);
      if (completion) {
        event.preventDefault();
        setValue(completion);
      }
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className={styles.terminal}
      onClick={() => input.current?.focus({ preventScroll: true })}
      data-testid="terminal"
    >
      <div className={styles.bar} aria-hidden="true">
        <span />
        <span />
        <span />
        <p>nk — zsh — 80×24</p>
      </div>
      <div
        ref={screen}
        className={styles.screen}
        role="log"
        aria-live="polite"
        aria-label={t('lab.terminal.title')}
      >
        {lines.map((line, index) => (
          <p key={index} className={styles.line} data-tone={line.tone}>
            {line.text}
          </p>
        ))}
        <form onSubmit={submit} className={styles.inputRow}>
          <label htmlFor={inputId} className={styles.prompt}>
            {PROMPT}
            <span className="sr-only">{t('lab.terminal.inputLabel')}</span>
          </label>
          <input
            ref={input}
            id={inputId}
            className={styles.input}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            maxLength={60}
          />
        </form>
      </div>
    </div>
  );
}
