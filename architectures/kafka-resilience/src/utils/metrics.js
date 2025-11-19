const metrics = {
  success: 0,
  retries: 0,
  fatalError: 0,
  dlqSent: 0,
  reprocessed: 0,
  reconnects: 0,
};

export function trackSuccess() { metrics.success++; }
export function trackRetry() { metrics.retries++; }
export function trackFatalError() { metrics.fatalError++; }
export function trackDlqSent() { metrics.dlqSent++; }
export function trackReprocessed() { metrics.reprocessed++; }
export function trackReconnect() { metrics.reconnects++; }

export function printMetrics() {
  console.table(metrics);
}

export function resetMetrics() {
  Object.keys(metrics).forEach(k => (metrics[k] = 0));
}
