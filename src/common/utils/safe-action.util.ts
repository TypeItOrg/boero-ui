export async function safelyRunAction<T extends { error?: string }>(action: Promise<T>, fallbackMessage: string): Promise<T> {
  try {
    return await action;
  } catch {
    return { error: fallbackMessage } as T;
  }
}
