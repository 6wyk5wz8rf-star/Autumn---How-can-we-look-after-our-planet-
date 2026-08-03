import { escapeAttr, escapeHTML } from '../utils/dom.js';
import { profileSymbolIcon } from './ProfileGate.js';

const icons = {
  planet: '<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M4 12h16M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5M12 3.5C9.8 5.9 8.7 8.7 8.7 12s1.1 6.1 3.3 8.5"/></svg>',
  key: '<svg viewBox="0 0 24 24" focusable="false"><circle cx="8.5" cy="10" r="4"/><path d="m11.5 12.7 7 7m-2.2-2.2 2.2-2.2m-4.6-.2 2.2-2.2"/></svg>',
  work: '<svg viewBox="0 0 24 24" focusable="false"><path d="M5 4.5h10l4 4v11H5z"/><path d="M15 4.5v4h4M8 12h8M8 15.5h6"/></svg>',
  digits: '<svg viewBox="0 0 24 24" focusable="false"><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/></svg>',
  glossary: '<svg viewBox="0 0 24 24" focusable="false"><path d="M4.5 5.5h6.2c1.2 0 2.1.9 2.1 2.1v11c0-1.2-.9-2.1-2.1-2.1H4.5zM19.5 5.5h-4.6c-1.2 0-2.1.9-2.1 2.1v11c0-1.2.9-2.1 2.1-2.1h4.6z"/></svg>',
  support: '<svg viewBox="0 0 24 24" focusable="false"><path d="M5 7h14M5 17h14M8 4v6M16 14v6"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="17" r="2"/></svg>',
};

const NAV_ITEMS = [
  { id: 'home', label: 'Our Planet', icon: icons.planet },
  { id: 'keys', label: 'My Keys', icon: icons.key },
  { id: 'work', label: 'My Work', icon: icons.work },
  { id: 'key', label: 'Enter a Key', icon: icons.digits },
];

function currentNav(routeName) {
  if (['home', 'atlas', 'numbers', 'number-tool', 'activity'].includes(routeName)) return 'home';
  if (['work', 'work-detail'].includes(routeName)) return 'work';
  if (routeName === 'keys') return 'keys';
  if (routeName === 'key') return 'key';
  return '';
}

export function renderNavigation(routeName) {
  const active = currentNav(routeName);
  return `<nav class="primary-nav no-print" aria-label="Main navigation">
    ${NAV_ITEMS.map((item) => `<button class="nav-item" type="button" data-route="${item.id}" ${active === item.id ? 'aria-current="page"' : ''}>
      <span class="nav-icon" aria-hidden="true">${item.icon}</span>
      <span>${item.label}</span>
    </button>`).join('')}
  </nav>`;
}

export function renderShell({ route, profile, content, modal = '', persistenceWarning = false }) {
  const name = profile?.displayName || profile?.name || 'Choose profile';
  const symbol = profile ? profileSymbolIcon(profile.symbol) : '◌';
  return `<div class="app-shell" data-route-name="${escapeAttr(route.name)}">
    <header class="app-header no-print">
      <div class="brand-lockup" aria-label="Our Planet">
        <span class="brand-mark" aria-hidden="true">${icons.planet}</span>
        <span class="brand-copy">
          <span class="brand-title">Our Planet</span>
        </span>
      </div>
      ${renderNavigation(route.name)}
      <div class="header-actions">
        <button class="icon-button" type="button" data-action="open-glossary" aria-label="Open the visual glossary" title="Visual glossary">${icons.glossary}</button>
        <button class="icon-button" type="button" data-route="settings" aria-label="Accessibility and reading settings" title="Accessibility settings">${icons.support}</button>
        <button class="profile-pill" type="button" data-action="switch-profile" aria-label="Switch learner profile. Current profile: ${escapeAttr(name)}">
          <span class="profile-symbol" aria-hidden="true">${escapeHTML(symbol)}</span>
          <span class="profile-name">${escapeHTML(name)}</span>
        </button>
      </div>
    </header>
    ${persistenceWarning ? '<div class="persistence-warning no-print" role="status"><strong>Temporary session:</strong> this browser blocked device storage. Work can be used now, but an adult should export a backup before the browser closes.</div>' : ''}
    <main class="main-content" id="main-content" tabindex="-1">${content}</main>
    <div class="toast-region" id="toast-region" aria-live="polite" aria-atomic="true"></div>
    <div id="popover-layer"></div>
    <div id="modal-layer">${modal}</div>
  </div>`;
}
