import type { ScoreEntry } from "./submit/route";

type ScoresGlobal = {
    scores?: Map<string, ScoreEntry>;
};

const globalScores = globalThis as unknown as ScoresGlobal;

type ScoreWaiter = (entry: ScoreEntry) => void;

const waitersById = new Map<string, ScoreWaiter[]>();

function getStore() {
    if (!globalScores.scores) {
        globalScores.scores = new Map<string, ScoreEntry>();
    }
    return globalScores.scores;
}

function isScoreComplete(entry: ScoreEntry): boolean {
    return entry.checklang !== undefined && entry.sentiment !== undefined;
}

/**
 * Resolves when the entry exists and both checklang and sentiment are populated
 * (async scoring finished). If there is no entry for id, resolves to undefined.
 */
export function getScore(id: string): Promise<ScoreEntry | undefined> {
    const entry = getStore().get(id);
    if (!entry) {
        return Promise.resolve(undefined);
    }
    if (isScoreComplete(entry)) {
        return Promise.resolve(entry);
    }
    return new Promise<ScoreEntry>((resolve) => {
        const list = waitersById.get(id) ?? [];
        list.push(resolve);
        waitersById.set(id, list);
    });
}

export function setScore(entry: ScoreEntry) {
    getStore().set(entry.id, entry);
    if (!isScoreComplete(entry)) {
        return;
    }
    const waiters = waitersById.get(entry.id);
    if (!waiters?.length) {
        return;
    }
    waitersById.delete(entry.id);
    for (const w of waiters) {
        w(entry);
    }
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
