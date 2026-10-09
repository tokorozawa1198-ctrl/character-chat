/** A small, character-specific checkpoint survives stale full-save writes. */
export type PlayerProgress = { userLevel: number; userExp: number };
export const progressKey = (saveKey: string) => `${saveKey}_progress_v1`;

export function validProgress(value: unknown): PlayerProgress | null {
  if (!value || typeof value !== "object") return null;
  const { userLevel, userExp = 0 } = value as PlayerProgress;
  if (!Number.isSafeInteger(userLevel) || userLevel < 1 || !Number.isSafeInteger(userExp) || userExp < 0) return null;
  return { userLevel, userExp };
}

export function furthestProgress(a: PlayerProgress, b: PlayerProgress | null): PlayerProgress {
  return b && (b.userLevel > a.userLevel || (b.userLevel === a.userLevel && b.userExp > a.userExp)) ? b : a;
}

export function readProgress(storage: Pick<Storage, "getItem">, saveKey: string, save: unknown): PlayerProgress {
  const current = validProgress(save) ?? { userLevel: 1, userExp: 0 };
  const raw = storage.getItem(progressKey(saveKey));
  if (!raw) return current;
  // A damaged checkpoint must not prevent loading an otherwise valid full save.
  try { return furthestProgress(current, validProgress(JSON.parse(raw))); }
  catch { return current; }
}

export function writeProgress(storage: Pick<Storage, "getItem" | "setItem">, saveKey: string, progress: PlayerProgress): PlayerProgress {
  const next = readProgress(storage, saveKey, progress);
  const serialized = JSON.stringify(next);
  if (storage.getItem(progressKey(saveKey)) !== serialized) storage.setItem(progressKey(saveKey), serialized);
  return next;
}

export function advanceProgress(progress: PlayerProgress, amount: number): PlayerProgress {
  let { userLevel, userExp } = progress;
  userExp += amount;
  while (userExp >= 100 + (userLevel - 1) * 50) {
    userExp -= 100 + (userLevel - 1) * 50;
    userLevel += 1;
  }
  return { userLevel, userExp };
}
