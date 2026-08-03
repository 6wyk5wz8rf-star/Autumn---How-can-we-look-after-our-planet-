/** Service-worker, update, connectivity, and home-screen installation helpers. */

const networkListeners = new Set();
const installListeners = new Set();
const updateTimers = new Map();
let deferredInstallPrompt = null;

export function isServiceWorkerSupported() {
  return Boolean(globalThis.navigator?.serviceWorker);
}

export function isOnline() {
  return globalThis.navigator?.onLine !== false;
}

export function isInstalledApp() {
  try {
    return Boolean(
      globalThis.matchMedia?.("(display-mode: standalone)").matches
      || globalThis.navigator?.standalone,
    );
  } catch {
    return false;
  }
}

function emitNetwork() {
  const status = Object.freeze({ online: isOnline(), at: new Date().toISOString() });
  networkListeners.forEach((listener) => {
    try {
      listener(status);
    } catch {
      // Connectivity observers cannot affect application state.
    }
  });
}

function emitInstall(detail) {
  installListeners.forEach((listener) => {
    try {
      listener(detail);
    } catch {
      // Installation remains user-controlled if an observer fails.
    }
  });
}

export function subscribeToNetworkStatus(listener) {
  if (typeof listener !== "function") throw new TypeError("A network listener is required");
  networkListeners.add(listener);
  listener(Object.freeze({ online: isOnline(), at: new Date().toISOString() }));
  return () => networkListeners.delete(listener);
}

export function subscribeToInstallStatus(listener) {
  if (typeof listener !== "function") throw new TypeError("An install listener is required");
  installListeners.add(listener);
  listener({ promptAvailable: Boolean(deferredInstallPrompt), installed: isInstalledApp() });
  return () => installListeners.delete(listener);
}

function defaultWorkerUrl() {
  if (typeof document !== "undefined") return new URL("service-worker.js", document.baseURI).href;
  return "service-worker.js";
}

function watchForUpdate(registration, onUpdate) {
  registration.addEventListener?.("updatefound", () => {
    const worker = registration.installing;
    if (!worker) return;
    worker.addEventListener("statechange", () => {
      if (worker.state !== "installed") return;
      const isUpdate = Boolean(navigator.serviceWorker.controller);
      if (isUpdate) onUpdate?.({ registration, worker });
    });
  });
}

/**
 * Register the public service-worker file. Passing the URL is recommended when
 * the app's build pipeline gives it a different name.
 */
export async function registerServiceWorker(options = {}) {
  if (!isServiceWorkerSupported()) {
    return Object.freeze({ supported: false, registered: false, registration: null });
  }
  const url = options.url || defaultWorkerUrl();
  try {
    const registration = await navigator.serviceWorker.register(url, {
      ...(options.scope ? { scope: options.scope } : {}),
      updateViaCache: options.updateViaCache || "none",
      type: options.type || "classic",
    });
    watchForUpdate(registration, options.onUpdateAvailable);
    options.onRegistered?.(registration);

    if (options.checkForUpdates !== false) {
      registration.update().catch(() => {});
    }
    if (Number.isFinite(options.updateIntervalMs) && options.updateIntervalMs > 0) {
      const interval = Math.max(60000, options.updateIntervalMs);
      const previous = updateTimers.get(registration.scope);
      if (previous) clearInterval(previous);
      const timer = setInterval(() => {
        if (isOnline()) registration.update().catch(() => {});
      }, interval);
      updateTimers.set(registration.scope, timer);
    }

    const ready = navigator.serviceWorker.ready.catch(() => registration);
    return Object.freeze({
      supported: true,
      registered: true,
      registration,
      ready,
      scope: registration.scope,
    });
  } catch (error) {
    options.onError?.(error);
    return Object.freeze({ supported: true, registered: false, registration: null, error });
  }
}

export async function getServiceWorkerRegistration(scope) {
  if (!isServiceWorkerSupported()) return null;
  try {
    return scope
      ? navigator.serviceWorker.getRegistration(scope)
      : navigator.serviceWorker.getRegistration();
  } catch {
    return null;
  }
}

export async function checkForServiceWorkerUpdate(registration = null) {
  const activeRegistration = registration || await getServiceWorkerRegistration();
  if (!activeRegistration) return { supported: isServiceWorkerSupported(), checked: false };
  try {
    await activeRegistration.update();
    return { supported: true, checked: true, registration: activeRegistration };
  } catch (error) {
    return { supported: true, checked: false, registration: activeRegistration, error };
  }
}

export function activateWaitingServiceWorker(registration, { reload = false } = {}) {
  const worker = registration?.waiting;
  if (!worker) return false;
  if (reload && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener("controllerchange", () => globalThis.location?.reload(), { once: true });
  }
  worker.postMessage({ type: "SKIP_WAITING" });
  return true;
}

export async function unregisterServiceWorkers({ confirm = false, scopePrefix = null } = {}) {
  if (!confirm) throw new Error("Removing offline support requires explicit confirmation");
  if (!isServiceWorkerSupported()) return 0;
  const registrations = await navigator.serviceWorker.getRegistrations();
  let removed = 0;
  for (const registration of registrations) {
    if (scopePrefix && !registration.scope.startsWith(scopePrefix)) continue;
    const timer = updateTimers.get(registration.scope);
    if (timer) clearInterval(timer);
    updateTimers.delete(registration.scope);
    if (await registration.unregister()) removed += 1;
  }
  return removed;
}

export function canPromptInstall() {
  return Boolean(deferredInstallPrompt);
}

export async function promptInstall() {
  if (isInstalledApp()) return { available: false, outcome: "already-installed" };
  const event = deferredInstallPrompt;
  if (!event) {
    return {
      available: false,
      outcome: "unavailable",
      hint: "On iPad, use Safari’s Share menu and choose Add to Home Screen.",
    };
  }
  deferredInstallPrompt = null;
  try {
    await event.prompt();
    const choice = await event.userChoice;
    emitInstall({ promptAvailable: false, installed: choice.outcome === "accepted", outcome: choice.outcome });
    return { available: true, outcome: choice.outcome, platform: choice.platform };
  } catch (error) {
    return { available: true, outcome: "error", error };
  }
}

export function getOfflineCapabilityStatus() {
  return Object.freeze({
    serviceWorkerSupported: isServiceWorkerSupported(),
    online: isOnline(),
    installed: isInstalledApp(),
    installPromptAvailable: canPromptInstall(),
  });
}

if (globalThis.addEventListener) {
  globalThis.addEventListener("online", emitNetwork);
  globalThis.addEventListener("offline", emitNetwork);
  globalThis.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    emitInstall({ promptAvailable: true, installed: false });
  });
  globalThis.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    emitInstall({ promptAvailable: false, installed: true });
  });
}

export const registerOfflineSupport = registerServiceWorker;
export const applyServiceWorkerUpdate = activateWaitingServiceWorker;
