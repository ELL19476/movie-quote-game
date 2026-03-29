import { ScoreEntry } from "../api/submit/route";

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

export function getScore(id: string): ScoreEntry | undefined {
    return getStore().get(id);
}

export function setScore(entry: ScoreEntry) {
    getStore().set(entry.id, entry);
}

export function getAllScores(): ScoreEntry[] {
    return Array.from(getStore().values());
}