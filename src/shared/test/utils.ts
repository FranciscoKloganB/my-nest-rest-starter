async function getAsyncError<T = unknown>(fn) {
  try {
    await fn();
  } catch (e) {
    return e as T;
  }
}

function getError<T = unknown>(fn) {
  try {
    fn();
  } catch (e) {
    return e as T;
  }
}

export { getAsyncError, getError };
