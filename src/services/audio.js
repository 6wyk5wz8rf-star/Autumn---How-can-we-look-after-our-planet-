/** Microphone recording helpers with explicit feature detection and cleanup. */

const activeSessions = new Set();

export class AudioRecordingError extends Error {
  constructor(message, code = "recording-error", cause) {
    super(message, { cause });
    this.name = "AudioRecordingError";
    this.code = code;
  }
}

export function isAudioRecordingSupported() {
  return Boolean(
    globalThis.navigator?.mediaDevices?.getUserMedia
    && globalThis.MediaRecorder,
  );
}

export function getSupportedAudioMimeType(preferredTypes = []) {
  if (!globalThis.MediaRecorder) return "";
  const candidates = [...preferredTypes, ...[
    "audio/webm;codecs=opus",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ]];
  const unique = [...new Set(candidates.filter(Boolean))];
  if (typeof MediaRecorder.isTypeSupported !== "function") return unique[0] || "";
  return unique.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  }) || "";
}

export function getAudioRecordingSupport() {
  const supported = isAudioRecordingSupported();
  return Object.freeze({
    supported,
    mediaDevices: Boolean(globalThis.navigator?.mediaDevices),
    getUserMedia: Boolean(globalThis.navigator?.mediaDevices?.getUserMedia),
    mediaRecorder: Boolean(globalThis.MediaRecorder),
    preferredMimeType: supported ? getSupportedAudioMimeType() : "",
    secureContext: globalThis.isSecureContext !== false,
  });
}

function elapsed(startedAt, pausedAt, pausedDuration) {
  const end = pausedAt || performance.now();
  return Math.max(0, Math.round(end - startedAt - pausedDuration));
}

function recordingError(error) {
  if (error instanceof AudioRecordingError) return error;
  const name = error?.name;
  if (name === "NotAllowedError" || name === "SecurityError") {
    return new AudioRecordingError("Microphone access was not allowed", "permission-denied", error);
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return new AudioRecordingError("No microphone was found", "microphone-missing", error);
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return new AudioRecordingError("The microphone is being used by another application", "microphone-busy", error);
  }
  return new AudioRecordingError(error?.message || "Audio recording could not start", "recording-error", error);
}

/**
 * Request the microphone and immediately begin recording. Permission is only
 * requested when this function is called in response to a learner action.
 */
export async function startAudioRecording(options = {}) {
  if (!isAudioRecordingSupported()) {
    throw new AudioRecordingError("Audio recording is not supported in this browser", "unsupported");
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: options.echoCancellation !== false,
        noiseSuppression: options.noiseSuppression !== false,
        autoGainControl: options.autoGainControl !== false,
        ...(options.constraints || {}),
      },
      video: false,
    });
  } catch (error) {
    throw recordingError(error);
  }

  const mimeType = options.mimeType || getSupportedAudioMimeType(options.preferredMimeTypes);
  let recorder;
  try {
    recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      ...(Number.isFinite(options.audioBitsPerSecond)
        ? { audioBitsPerSecond: Math.max(12000, Math.round(options.audioBitsPerSecond)) }
        : {}),
    });
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    throw recordingError(error);
  }

  const chunks = [];
  const startedAt = performance.now();
  let pausedAt = null;
  let pausedDuration = 0;
  let cancelled = false;
  let outcome = null;
  let timeout = null;
  let settleResult;
  let settleError;
  const resultPromise = new Promise((resolve, reject) => {
    settleResult = resolve;
    settleError = reject;
  });

  const notify = (state, extra = {}) => {
    try {
      options.onStateChange?.({ state, durationMs: elapsed(startedAt, pausedAt, pausedDuration), ...extra });
    } catch {
      // A visual observer must not interrupt the recorder.
    }
  };
  const release = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Track is already closed.
      }
    });
    activeSessions.delete(controller);
  };

  recorder.ondataavailable = (event) => {
    if (event.data?.size) chunks.push(event.data);
  };
  recorder.onerror = (event) => {
    const error = recordingError(event.error || new Error("Audio recording failed"));
    release();
    notify("error", { error });
    settleError(error);
  };
  recorder.onstop = () => {
    const durationMs = elapsed(startedAt, pausedAt, pausedDuration);
    const finalMimeType = recorder.mimeType || mimeType || chunks[0]?.type || "audio/webm";
    outcome = cancelled
      ? { status: "cancelled", blob: null, mimeType: finalMimeType, durationMs }
      : {
        status: "finished",
        blob: new Blob(chunks, { type: finalMimeType }),
        mimeType: finalMimeType,
        durationMs,
      };
    release();
    notify(outcome.status, outcome);
    settleResult(outcome);
  };

  const controller = Object.freeze({
    get state() {
      if (outcome) return outcome.status;
      return recorder.state;
    },
    get mimeType() {
      return recorder.mimeType || mimeType;
    },
    get durationMs() {
      return elapsed(startedAt, pausedAt, pausedDuration);
    },
    get stream() {
      return stream;
    },
    pause() {
      if (recorder.state !== "recording") return false;
      recorder.pause();
      pausedAt = performance.now();
      notify("paused");
      return true;
    },
    resume() {
      if (recorder.state !== "paused") return false;
      pausedDuration += performance.now() - pausedAt;
      pausedAt = null;
      recorder.resume();
      notify("recording");
      return true;
    },
    async stop() {
      if (outcome) return outcome;
      if (recorder.state !== "inactive") {
        try {
          recorder.requestData?.();
        } catch {
          // Some Safari versions do not allow requestData immediately before stop.
        }
        recorder.stop();
      }
      return resultPromise;
    },
    async cancel() {
      if (outcome) return outcome;
      cancelled = true;
      if (recorder.state !== "inactive") recorder.stop();
      else {
        outcome = { status: "cancelled", blob: null, mimeType: recorder.mimeType || mimeType, durationMs: 0 };
        release();
        settleResult(outcome);
      }
      return resultPromise;
    },
    result: resultPromise,
  });

  activeSessions.add(controller);
  try {
    recorder.start(Number.isFinite(options.timesliceMs) ? Math.max(100, options.timesliceMs) : 1000);
  } catch (error) {
    activeSessions.delete(controller);
    stream.getTracks().forEach((track) => track.stop());
    throw recordingError(error);
  }
  notify("recording");

  if (Number.isFinite(options.maxDurationMs) && options.maxDurationMs > 0) {
    timeout = setTimeout(() => {
      if (recorder.state !== "inactive") controller.stop().catch(() => {});
    }, Math.max(1000, options.maxDurationMs));
  }
  return controller;
}

export async function stopAllAudioRecordings({ cancel = true } = {}) {
  const sessions = [...activeSessions];
  return Promise.all(sessions.map((session) => (cancel ? session.cancel() : session.stop())));
}

export function createAudioObjectUrl(blob) {
  if (!(blob instanceof Blob)) throw new TypeError("An audio Blob is required");
  if (!globalThis.URL?.createObjectURL) return null;
  return URL.createObjectURL(blob);
}

export function revokeAudioObjectUrl(url) {
  try {
    URL.revokeObjectURL(url);
  } catch {
    // No-op for an already revoked/unsupported URL.
  }
}

export function playAudioBlob(blob, { volume = 1 } = {}) {
  if (typeof Audio === "undefined") return { supported: false, stop() {} };
  const url = createAudioObjectUrl(blob);
  if (!url) return { supported: false, stop() {} };
  const player = new Audio(url);
  player.volume = Math.min(1, Math.max(0, Number(volume) || 0));
  const cleanup = () => revokeAudioObjectUrl(url);
  player.addEventListener("ended", cleanup, { once: true });
  player.addEventListener("error", cleanup, { once: true });
  const started = player.play().then(
    () => ({ supported: true, status: "playing" }),
    (error) => {
      cleanup();
      return { supported: true, status: "blocked", error };
    },
  );
  return {
    supported: true,
    started,
    stop() {
      player.pause();
      player.currentTime = 0;
      cleanup();
    },
  };
}

export const createAudioRecorder = startAudioRecording;
