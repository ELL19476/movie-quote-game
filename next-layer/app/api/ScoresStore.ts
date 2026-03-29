import type { ScoreEntry } from "./submit/route";

type ScoresGlobal = {
    scores?: Map<string, ScoreEntry>;
};

const globalScores = globalThis as unknown as ScoresGlobal;

function getStore() {
    if (!globalScores.scores) {
        globalScores.scores = new Map<string, ScoreEntry>();
    }
    return globalScores.scores;
}

function isScoreComplete(entry: ScoreEntry): boolean {
    return entry.checklang !== undefined && entry.sentiment !== undefined;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits until the entry exists and both checklang and sentiment are set.
 * Uses polling instead of waiters so we never miss a completion due to
 * microtask / ordering races (waiter registered after setScore already ran).
 *
 * Note: In-memory store is per Node process; multiple serverless instances do
 * not share this map — use a shared store in production if needed.
 */
export async function getScore(
    id: string,
    options?: { pollIntervalMs?: number; maxWaitMs?: number }
): Promise<ScoreEntry | undefined> {
    const pollIntervalMs = options?.pollIntervalMs ?? 100;
    const maxWaitMs = options?.maxWaitMs ?? 120_000;
    const deadline = Date.now() + maxWaitMs;
    const waitStart = Date.now();
    /** If still no row after this, treat id as unknown (fast 404). */
    const entryGraceMs = 3000;

    while (Date.now() < deadline) {
        let entry = getStore().get(id);
        if (!entry) {
            if (Date.now() - waitStart < entryGraceMs) {
                await sleep(pollIntervalMs);
                continue;
            }
            return undefined;
        }
        if (isScoreComplete(entry)) {
            return entry;
        }
        // Let pending microtasks run (e.g. setScore from submit) before we sleep
        await Promise.resolve();
        entry = getStore().get(id);
        if (entry && isScoreComplete(entry)) {
            return entry;
        }
        await sleep(pollIntervalMs);
    }

    const last = getStore().get(id);
    if (last && isScoreComplete(last)) {
        return last;
    }
    return undefined;
}

export function setScore(entry: ScoreEntry) {
    getStore().set(entry.id, entry);
}

/** Current entry from memory if present (may still be awaiting checklang/sentiment). */
export function peekScore(id: string): ScoreEntry | undefined {
    return getStore().get(id);
}

export function getRankForId(id: string): number | null {
    const entries = getAllScores().filter(
        (e): e is ScoreEntry & { finalScore: number } =>
            typeof e.finalScore === "number"
    );
    const sorted = [...entries].sort((a, b) => b.finalScore - a.finalScore);
    const idx = sorted.findIndex((e) => e.id === id);
    return idx >= 0 ? idx + 1 : null;
}

export function getAllScores(): ScoreEntry[] {
    return Array.from(getStore().values());
}
