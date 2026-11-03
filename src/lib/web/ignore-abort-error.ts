import { Platform } from 'react-native';

function isAbortError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError' || error.message.includes('signal is aborted');
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const nativeAbort = AbortController.prototype.abort;

  AbortController.prototype.abort = function abort(this: AbortController, reason?: unknown) {
    try {
      nativeAbort.call(this, reason);
    } catch (error) {
      if (!isAbortError(error)) throw error;
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (!isAbortError(event.reason)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  });
}
