"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ScoreEntry } from "../api/submit/route";

function combinedScore(data: ScoreEntry): number {
  return (
    (((data.sentiment?.score ?? 0) + 1) / 2) * 0.8 +
    ((data.checklang?.score ?? 0) / 2) * 0.2
  );
}

export default function LazyScorePanel({ scoreId }: { scoreId: string }) {
  const [entry, setEntry] = useState<ScoreEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEntry(null);
    setError(null);

    fetch(`/api/score/${encodeURIComponent(scoreId)}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Score not found" : "Failed to load score");
        }
        return res.json() as Promise<ScoreEntry>;
      })
      .then((data) => {
        if (!cancelled) setEntry(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load score");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scoreId]);

  if (error) {
    return (
      <p className="text-sm text-red-400" role="alert">
        {error}
      </p>
    );
  }

  if (!entry) {
    return (
      <p className="text-sm text-zinc-400" aria-live="polite">
        Loading score…
      </p>
    );
  }

  const pct = Math.round(combinedScore(entry) * 100);

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-zinc-100">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Your score</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{pct}%</p>
      <Link
        href={`/misquotes/${entry.id}`}
        className="mt-2 inline-block text-sm text-green-400 underline decoration-green-400/40 underline-offset-2 hover:text-green-300"
      >
        Open full results
      </Link>
    </div>
  );
}
