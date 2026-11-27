import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';

/**
 * Allow-list of terminal commands. Nothing here touches the operating system or
 * the network — every command returns static text built from the site's data.
 * Each command returns an array of lines: string | { text, tone: 'accent'|'muted'|'error' }.
 */
export const COMMANDS = {
  help: {
    description: 'List available commands',
    run: () => [
      { text: 'Available commands:', tone: 'muted' },
      ...Object.entries(COMMANDS).map(
        ([name, command]) => `  ${name.padEnd(10)} ${command.description}`,
      ),
    ],
  },
  whoami: {
    description: 'Who is behind this site',
    run: () => [
      { text: profile.name.toLowerCase().replace(' ', '.'), tone: 'accent' },
      `${profile.role} · ${profile.city}, ${profile.country}`,
    ],
  },
  about: {
    description: 'Short bio',
    run: () => [
      `${profile.name} — ${profile.role}, based in ${profile.city}, ${profile.country}.`,
      'Builds intelligent software, scalable backend systems, interactive web',
      'applications and AI-powered digital products.',
    ],
  },
  skills: {
    description: 'Technology stack by category',
    run: () =>
      skillCategories.flatMap((category) => [
        { text: `[${category.label.en}]`, tone: 'accent' },
        `  ${category.items.join(' · ')}`,
      ]),
  },
  projects: {
    description: 'Selected works',
    run: () => [
      ...projects.map(
        (project) => `  ${project.number}  ${project.title.padEnd(22)} ${project.category.en}`,
      ),
      { text: 'Open a case: scroll to Selected Works or visit /projects/<slug>', tone: 'muted' },
    ],
  },
  contact: {
    description: 'How to reach me',
    run: () => [
      `  email     ${profile.email}`,
      `  phone     ${profile.phoneDisplay}`,
      `  whatsapp  ${profile.whatsapp}`,
      `  location  ${profile.city}, ${profile.country}`,
    ],
  },
  clear: {
    description: 'Clear the screen',
    run: () => 'CLEAR',
  },
};

export function runCommand(input) {
  const name = input.trim().toLowerCase();
  if (!name) return [];
  const command = COMMANDS[name];
  if (!command) {
    return [
      {
        text: `command not found: ${name.slice(0, 40)} — type "help" to see available commands`,
        tone: 'error',
      },
    ];
  }
  return command.run();
}

export function completeCommand(partial) {
  const value = partial.trim().toLowerCase();
  if (!value) return null;
  const matches = Object.keys(COMMANDS).filter((name) => name.startsWith(value));
  return matches.length === 1 ? matches[0] : null;
}
