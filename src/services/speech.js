/** Browser speech-synthesis helpers. Importing this module is safe in tests/SSR. */

const listeners = new Set();
let activeSpeech = null;

function synthesis() {
  return globalThis.speechSynthesis || null;
}

function emit(detail) {
  listeners.forEach((listener) => {
    try {
      listener(detail);
    } catch {
      // Speech should not fail because an observer failed.
    }
  });
}

export function isSpeechSupported() {
  return Boolean(synthesis() && globalThis.SpeechSynthesisUtterance);
}

export function getSpeechVoices() {
  if (!isSpeechSupported()) return [];
  try {
    return synthesis().getVoices().slice();
  } catch {
    return [];
  }
}

/** Safari often supplies voices shortly after page load rather than immediately. */
export async function loadSpeechVoices({ timeoutMs = 1500 } = {}) {
  const existing = getSpeechVoices();
  if (existing.length > 0 || !isSpeechSupported()) return existing;
  const engine = synthesis();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      engine.removeEventListener?.("voiceschanged", finish);
      resolve(getSpeechVoices());
    };
    const timer = setTimeout(finish, Math.max(0, timeoutMs));
    engine.addEventListener?.("voiceschanged", finish, { once: true });
    if (!("addEventListener" in engine)) {
      const previous = engine.onvoiceschanged;
      engine.onvoiceschanged = (...args) => {
        previous?.(...args);
        finish();
      };
    }
  });
}

function selectVoice(voices, { voice, voiceName, lang }) {
  if (voice && voices.includes(voice)) return voice;
  if (voiceName) {
    const named = voices.find((candidate) => candidate.name === voiceName)
      || voices.find((candidate) => candidate.name.toLowerCase() === String(voiceName).toLowerCase());
    if (named) return named;
  }
  if (lang) {
    const exact = voices.find((candidate) => candidate.lang.toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
    const language = lang.split("-")[0].toLowerCase();
    const approximate = voices.find((candidate) => candidate.lang.toLowerCase().startsWith(`${language}-`));
    if (approximate) return approximate;
  }
  return voices.find((candidate) => candidate.default) || null;
}

function boundedNumber(value, fallback, minimum, maximum) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

export function cancelSpeech(reason = "cancelled") {
  const engine = synthesis();
  try {
    engine?.cancel();
  } catch {
    // Cancellation is best-effort on older WebKit versions.
  }
  if (activeSpeech) {
    const current = activeSpeech;
    activeSpeech = null;
    current.finish({ supported: true, status: "cancelled", reason });
  }
}

export function pauseSpeech() {
  try {
    synthesis()?.pause();
    emit({ type: "pause" });
    return true;
  } catch {
    return false;
  }
}

export function resumeSpeech() {
  try {
    synthesis()?.resume();
    emit({ type: "resume" });
    return true;
  } catch {
    return false;
  }
}

export function getSpeechState() {
  const engine = synthesis();
  return Object.freeze({
    supported: isSpeechSupported(),
    speaking: Boolean(engine?.speaking),
    pending: Boolean(engine?.pending),
    paused: Boolean(engine?.paused),
    activeText: activeSpeech?.text || null,
  });
}

/**
 * Speak concise guidance or a place name. Unsupported browsers resolve with an
 * `unsupported` result so the visible text alternative can remain in control.
 */
export async function speak(text, options = {}) {
  const spokenText = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!spokenText) return { supported: isSpeechSupported(), status: "empty" };
  if (!isSpeechSupported()) return { supported: false, status: "unsupported" };
  if (options.cancelPrevious !== false) cancelSpeech("replaced");

  const engine = synthesis();
  const utterance = new SpeechSynthesisUtterance(spokenText);
  const voices = await loadSpeechVoices({ timeoutMs: options.voiceTimeoutMs ?? 1000 });
  const lang = String(options.lang || "en-GB");
  const selectedVoice = selectVoice(voices, { ...options, lang });
  utterance.lang = selectedVoice?.lang || lang;
  utterance.voice = selectedVoice;
  utterance.rate = boundedNumber(options.rate, 0.9, 0.1, 10);
  utterance.pitch = boundedNumber(options.pitch, 1, 0, 2);
  utterance.volume = boundedNumber(options.volume, 1, 0, 1);

  return new Promise((resolve) => {
    let settled = false;
    const timeoutMs = boundedNumber(options.timeoutMs, 120000, 1000, 300000);
    const timer = setTimeout(() => {
      if (settled) return;
      try {
        engine.cancel();
      } catch {
        // Best effort.
      }
      finish({ supported: true, status: "error", error: "Speech timed out" });
    }, timeoutMs);
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (activeSpeech?.utterance === utterance) activeSpeech = null;
      emit({ type: result.status, text: spokenText, result });
      resolve(result);
    };
    activeSpeech = { utterance, text: spokenText, finish };
    utterance.onstart = () => emit({ type: "start", text: spokenText });
    utterance.onpause = () => emit({ type: "pause", text: spokenText });
    utterance.onresume = () => emit({ type: "resume", text: spokenText });
    utterance.onend = () => finish({ supported: true, status: "finished" });
    utterance.onerror = (event) => {
      const error = event.error || "Speech could not be played";
      const cancelled = error === "canceled" || error === "interrupted";
      finish({ supported: true, status: cancelled ? "cancelled" : "error", error });
    };
    try {
      engine.speak(utterance);
    } catch (error) {
      finish({ supported: true, status: "error", error: error.message });
    }
  });
}

export function subscribeToSpeech(listener) {
  if (typeof listener !== "function") throw new TypeError("A speech listener is required");
  listeners.add(listener);
  listener({ type: "state", state: getSpeechState() });
  return () => listeners.delete(listener);
}

export const pronounce = speak;
export const stopSpeech = cancelSpeech;
