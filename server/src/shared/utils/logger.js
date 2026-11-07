export function logError(message, error, context = {}) {
  console.error(message, {
    ...context,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
}
