export function formatDate(value, options = {}) {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: options.year ? 'numeric' : undefined,
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function humanise(value = '') {
  return value
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function truncate(value = '', length = 100) {
  const string = String(value);
  return string.length > length ? `${string.slice(0, length - 1).trim()}…` : string;
}
