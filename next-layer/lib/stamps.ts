import fs from "fs";
import path from "path";
import type { Quote } from "@/app/types/Quote";

export type ClipTimestamp = {
    start: number;
    end: number;
};

export type StampCue = ClipTimestamp & {
    index: number;
    text: string;
};

export function parseTimeToSeconds(timeStr: string): number {
    const [time, ms] = timeStr.split(",");
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
}

function cleanCueText(text: string): string {
    return text
        .replace(/^\(Transcribed by TurboScribe[^\)]*\)\s*/i, "")
        .trim();
}

export function parseStampsJson(raw: string): StampCue[] {
    const data = JSON.parse(raw);

    if (!data?.chunks || !Array.isArray(data.chunks)) {
        throw new Error("Invalid timestamp JSON format");
    }

    return data.chunks.map((chunk: any, i: number) => {
        if (!Array.isArray(chunk.timestamp) || chunk.timestamp.length !== 2) {
            throw new Error(`Invalid timestamp at chunk ${i}`);
        }

        const [start, end] = chunk.timestamp;

        return {
            index: i,
            start: Number(start),
            end: Number(end),
            text: (chunk.text ?? "").trim(),
        };
    });
}

function movieLabelFromTimestampFilename(filename: string): string {
    const base = path.basename(filename);
    const m = /^clip_(\d+).json$/.exec(base);
    if (m) return `Clip ${m[1]}`;
    return base;
}

export function idFromTimestampFilename(filename: string): number {
    const match = filename.match(/^clip_(\d+).json$/);

    if (!match) throw new Error("File not found");
    console.log("ID From Timestamp Filename", match[1]);
    return Number(match[1]);
}

/** returns the index that should be played */
export function findWordInTimestampFileByID(id: number, word: string): number {
    const filePath = path.join(
        process.cwd(),
        "public",
        "timestamps",
        `clip_${id}.json`
    );

    const raw = fs.readFileSync(filePath, "utf-8");
    const cues = parseStampsJson(raw);

    const normalizedWord = word.trim().toLowerCase();

    const match = cues.find((cue) =>
        cue.text.toLowerCase().includes(normalizedWord)
    );

    if (!match) {
        throw new Error(
            `Word "${word}" not found in timestamp file clip_${id}.json`
        );
    }

    return match.index;
}

/**
 * Picks a random timestamp file under public/timestamps, then a random non-empty cue.
 * With a single file the file choice is deterministic; cue selection is still random.
 */
export function getRandomQuoteFromTimestamps(): Quote {
    const dir = path.join(process.cwd(), "public", "timestamps");
    const files = fs
        .readdirSync(dir)
        .filter((f) => !f.startsWith(".") && fs.statSync(path.join(dir, f)).isFile());

    if (files.length === 0) {
        throw new Error(`No timestamp files in ${dir}`);
    }

    const file = files[Math.floor(Math.random() * files.length)]!;
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const cues = parseStampsJson(raw).filter((c) => c.text.length > 0);

    if (cues.length === 0) {
        throw new Error(`No cues with text in ${file}`);
    }
    return {
        text: cues.map((c) => c.text).join(" "),
        id: idFromTimestampFilename(file),
    };
}

export function clipTimestampsFromText(raw: string): ClipTimestamp[] {
    return parseStampsJson(raw).map(({ start, end }) => ({ start, end }));
}
