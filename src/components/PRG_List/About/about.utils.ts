import { ABOUT_DATE_FORMAT_OPTIONS } from '../../../configs/Constants';

const toVersionParts = (version: string | number): number[] =>
  String(version)
    .replace(/\.x$/i, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);

export const isOutdatedVersion = (
  currentVersion: string | number,
  latestVersion: string | number
): boolean => {
  const current = toVersionParts(currentVersion);
  const latest = toVersionParts(latestVersion);
  const maxLength = Math.max(current.length, latest.length);

  for (let i = 0; i < maxLength; i += 1) {
    const currentPart = current[i] ?? 0;
    const latestPart = latest[i] ?? 0;

    if (currentPart !== latestPart) {
      return currentPart < latestPart;
    }
  }

  return false;
};

export const formatAboutDate = (date: string): string =>
  new Date(date).toLocaleString('en-US', ABOUT_DATE_FORMAT_OPTIONS);
