import { escapeAttr, escapeHTML } from '../utils/dom.js';
import { profileSymbolIcon } from './ProfileGate.js';

const NAV_ITEMS = [
  { id: 'home', label: 'Our Planet', icon: '◉' },
  { id: 'keys', label: 'My Keys', icon: '⌘' },
  { id: 'work', label: 'My Work', icon: '▱' },
  { id: 'key', label: 'Enter a Key', icon: '⌁' },
];

function currentNav(routeName) {
  if (['home', 'atlas', 'activity'].includes(routeName)) return 'home';
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
      <button class="brand-button" type="button" data-route="home" aria-label="Go to Our Planet">
        <span class="brand-mark" aria-hidden="true">◉</span>
        <span class="brand-copy">
          <span class="brand-title">Our Planet</span>
          <span class="brand-subtitle optional-detail">How can we look after it?</span>
        </span>
      </button>
      ${renderNavigation(route.name)}
      <div class="header-actions">
        <button class="icon-button" type="button" data-action="open-glossary" aria-label="Open the visual glossary" title="Visual glossary">Aa</button>
        <button class="icon-button" type="button" data-route="settings" aria-label="Accessibility and reading settings" title="Accessibility settings">◐</button>
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
