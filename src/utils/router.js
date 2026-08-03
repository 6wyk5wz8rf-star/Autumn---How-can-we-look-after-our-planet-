const DEFAULT_ROUTE = { name: 'home', params: {} };

export function parseRoute(hash = globalThis.location?.hash || '') {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (!path || path === 'home' || path === 'our-planet') return DEFAULT_ROUTE;
  const [name, ...parts] = path.split('/').map(decodeURIComponent);

  if (name === 'activity' && parts[0]) return { name: 'activity', params: { activityId: parts[0] } };
  if (name === 'work' && parts[0]) return { name: 'work-detail', params: { artifactId: parts[0] } };
  if (name === 'print' && parts[0] === 'key-guide') return { name: 'key-guide', params: {} };

  const supported = new Set(['atlas', 'keys', 'work', 'key', 'settings', 'maintenance']);
  return supported.has(name) ? { name, params: {} } : DEFAULT_ROUTE;
}

export function navigate(name, value) {
  const route = value ? `#/${name}/${encodeURIComponent(value)}` : `#/${name}`;
  if (globalThis.location.hash === route) globalThis.dispatchEvent(new HashChangeEvent('hashchange'));
  else globalThis.location.hash = route;
}

export function routeLabel(route) {
  return ({
    home: 'Our Planet',
    atlas: 'Planet Atlas',
    keys: 'My Keys',
    work: 'My Work',
    'work-detail': 'Saved work',
    key: 'Enter a Key',
    activity: 'Key Activity',
    settings: 'Accessibility',
    maintenance: 'Adult utility',
    'key-guide': 'Printable Key Guide',
  })[route.name] || 'Our Planet';
}
