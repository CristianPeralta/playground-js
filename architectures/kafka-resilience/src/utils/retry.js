export async function retry(fn, maxRetries, backoffMs, onAttempt) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (onAttempt) onAttempt(attempt, err);
      if (attempt >= maxRetries) throw err;
      await new Promise(res => setTimeout(res, typeof backoffMs === 'function' ? backoffMs(attempt) : backoffMs));
    }
  }
}

// Backoff exponencial
export function exponentialBackoff(baseMs = 1000, factor = 2) {
  return (attempt) => baseMs * Math.pow(factor, attempt - 1);
}
