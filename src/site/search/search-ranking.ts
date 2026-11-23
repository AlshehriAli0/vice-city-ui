import { ENTRIES, type Entry } from "../catalogue/catalogue";

const index = ENTRIES.map(entry => {
  const name = entry.name.toLowerCase();
  return {
    entry,
    name,
    words: name.split(/[\s/&,]+/).filter(Boolean),
    sdk: entry.sdk.toLowerCase(),
    section: entry.section.title.toLowerCase(),
  };
});

const editDistanceRow = (a: string, b: string, row: number, grid: number[][]) => {
  const previous = grid[row - 1];
  const result = [row];

  for (let column = 1; column <= b.length; column++) {
    const cost = a[row - 1] === b[column - 1] ? 0 : 1;
    const adjacent = Math.min(previous[column] + 1, result[column - 1] + 1, previous[column - 1] + cost);
    const canTranspose = row > 1 && column > 1;
    const isTransposed = a[row - 1] === b[column - 2] && a[row - 2] === b[column - 1];
    result.push(canTranspose && isTransposed ? Math.min(adjacent, grid[row - 2][column - 2] + 1) : adjacent);
  }

  return result;
};

const within = (a: string, b: string, limit: number): boolean => {
  if (Math.abs(a.length - b.length) > limit) return false;

  const grid = [Array.from({ length: b.length + 1 }, (_, column) => column)];
  for (let row = 1; row <= a.length; row++) grid.push(editDistanceRow(a, b, row, grid));

  return grid[a.length][b.length] <= limit;
};

const subsequence = (needle: string, hay: string): boolean => {
  let at = 0;
  for (const char of hay) if (char === needle[at]) at += 1;
  return at === needle.length;
};

const nameScore = (name: string, words: string[], query: string): number => {
  if (name === query) return 7;
  if (name.startsWith(query)) return 6;
  if (words.some(word => word.startsWith(query))) return 5;
  if (name.includes(query)) return 4;
  if (query.length < 3) return 0;

  const limit = query.length > 5 ? 2 : 1;
  if (words.some(word => within(query, word.slice(0, query.length + limit), limit))) return 3;
  return subsequence(query, name) ? 2 : 0;
};

const score = ({ name, words, sdk, section }: (typeof index)[number], query: string): number => {
  const title = nameScore(name, words, query);
  if (title) return title;
  if (sdk.includes(query)) return 1;
  if (section.includes(query)) return 0.5;
  return 0;
};

const rank = (query: string): Entry[] => {
  const needle = query.trim().toLowerCase();
  const scored = index.map(item => [item.entry, score(item, needle)] as const).filter(([, points]) => points > 0);
  const titled = scored.some(([, points]) => points >= 2);
  return scored
    .filter(([, points]) => !titled || points >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([entry]) => entry);
};

export { rank };
