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

/** Parses SRT-style subtitle content (index, time range, text block). */
export function parseStampsText(raw: string): StampCue[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const cues: StampCue[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") {
      i++;
      continue;
    }
    if (!/^\d+$/.test(line)) {
      i++;
      continue;
    }
    const idx = parseInt(line, 10);
    i++;
    if (i >= lines.length) break;

    const timeLine = lines[i];
    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
    );
    if (!timeMatch) {
      i++;
      continue;
    }
    const start = parseTimeToSeconds(timeMatch[1]);
    const end = parseTimeToSeconds(timeMatch[2]);
    i++;

    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i]);
      i++;
    }
    const text = cleanCueText(textLines.join("\n"));
    cues.push({ index: idx, start, end, text });
    i++;
  }

  return cues;
}

function movieLabelFromFilename(filename: string): string {
  const base = path.basename(filename);
  const m = /^stamps_(\d+)$/.exec(base);
  if (m) return `Clip ${m[1]}`;
  return base;
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
  const cues = parseStampsText(raw).filter((c) => c.text.length > 0);

  if (cues.length === 0) {
    throw new Error(`No cues with text in ${file}`);
  }
  return {
    text: cues.map((c) => c.text).join(" "),
    movie: movieLabelFromFilename(file),  
  };
}

export function clipTimestampsFromText(raw: string): ClipTimestamp[] {
  return parseStampsText(raw).map(({ start, end }) => ({ start, end }));
}
