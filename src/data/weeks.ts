import type { WeekDefinition } from '../types/progress';

// 3,183 characters over 12 weeks (~265 per week).
// Week N covers character IDs from (N-1)*265+1 to N*265, capped at 3183.
export const WEEKS: WeekDefinition[] = [
  {
    week: 1,
    month: 1,
    topic: 'Essentials',
    description: 'Numbers, greetings, and the most common characters in everyday Chinese.',
    characterRange: [1, 265],
  },
  {
    week: 2,
    month: 1,
    topic: 'People & Pronouns',
    description: 'People, pronouns, family titles, and common verbs of being and having.',
    characterRange: [266, 530],
  },
  {
    week: 3,
    month: 1,
    topic: 'Time & Place',
    description: 'Days, months, years, directions, and words for locations.',
    characterRange: [531, 795],
  },
  {
    week: 4,
    month: 2,
    topic: 'Daily Life',
    description: 'Food, eating, home, and everyday actions.',
    characterRange: [796, 1060],
  },
  {
    week: 5,
    month: 2,
    topic: 'Work & Study',
    description: 'Education, occupations, objects, and workplace vocabulary.',
    characterRange: [1061, 1325],
  },
  {
    week: 6,
    month: 2,
    topic: 'Nature & Body',
    description: 'Weather, nature, the human body, and health vocabulary.',
    characterRange: [1326, 1590],
  },
  {
    week: 7,
    month: 2,
    topic: 'Society & Culture',
    description: 'Government, society, tradition, and cultural concepts.',
    characterRange: [1591, 1855],
  },
  {
    week: 8,
    month: 3,
    topic: 'Movement & Change',
    description: 'Verbs of motion, change, interaction, and transformation.',
    characterRange: [1856, 2120],
  },
  {
    week: 9,
    month: 3,
    topic: 'Thought & Expression',
    description: 'Language, communication, emotions, and mental states.',
    characterRange: [2121, 2385],
  },
  {
    week: 10,
    month: 3,
    topic: 'Commerce & Technology',
    description: 'Economy, business, modern technology, and media.',
    characterRange: [2386, 2650],
  },
  {
    week: 11,
    month: 3,
    topic: 'Arts & Philosophy',
    description: 'Art, literature, philosophy, and higher-level abstractions.',
    characterRange: [2651, 2915],
  },
  {
    week: 12,
    month: 3,
    topic: 'Advanced Literacy',
    description: 'Rare, literary, and advanced characters completing the 3000-character corpus.',
    characterRange: [2916, 3183],
  },
];

export function getWeek(weekNumber: number): WeekDefinition | undefined {
  return WEEKS.find((w) => w.week === weekNumber);
}
