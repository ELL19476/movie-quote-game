"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MisquoteQuoteReveal from "@/app/components/MisquoteQuoteReveal";
import { ScoreEntry } from "../../api/submit/route";

/* ---------------- helpers ---------------- */

function ordinal(n: number) {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return `${n}st`;
    if (j === 2 && k !== 12) return `${n}nd`;
    if (j === 3 && k !== 13) return `${n}rd`;
    return `${n}th`;
}

function scoreToPercent(score01: number) {
    return (1 - Math.min(1, Math.max(0, score01))) * 100;
}

function colorForPercent(pct: number) {
    const t = pct / 100;
    const r = Math.round(255 * (1 - t));
    const g = Math.round(255 * t);
    return `rgb(${r}, ${g}, 0)`;
}

function clampPct(n: number) {
    return Math.min(100, Math.max(0, n));
}

function tokenize(text: string): string[] {
    return text.match(/[\w’']+|[.,!?;:]/g) ?? [];
}

/* ---------------- component ---------------- */

export default function MisquoteClient({
    id,
    initialData,
}: {
    id: string;
    initialData: ScoreEntry | null;
}) {
    const [data, setData] = useState<ScoreEntry | null>(initialData);

    /* ---------------- polling ---------------- */

    useEffect(() => {
        let cancelled = false;

        async function fetchScore() {
            try {
                const res = await fetch(`/api/score/${id}`, {
                    cache: "no-store",
                });

                if (!res.ok) return;

                const json = await res.json();

                if (!cancelled) setData(json);

                if (!json?.sentiment || !json?.checklang) {
                    setTimeout(fetchScore, 1000);
                }
            } catch {
                setTimeout(fetchScore, 2000);
            }
        }

        if (!data?.sentiment || !data?.checklang) {
            fetchScore();
        }

        return () => {
            cancelled = true;
        };
    }, [id]);

    /* ---------------- loading guard ---------------- */

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center text-zinc-400">
                Loading…
            </div>
        );
    }

    /* ---------------- safe derived state ---------------- */

    const sentiment = data.sentiment;
    const checklang = data.checklang;

    const sentimentReady = sentiment !== undefined;
    const grammarReady = checklang !== undefined;

    const sentimentScore = sentimentReady
        ? (sentiment.score + 1) / 2
        : null;

    const grammarScore = grammarReady
        ? checklang.score
        : null;


    const score =
        sentimentScore != null && grammarScore != null
            ? sentimentScore * 0.8 + grammarScore * 0.2
            : null;
    console.log("score", score)

    const pct = score != null ? scoreToPercent(score) : 0;
    const accent = score != null ? colorForPercent(pct) : "rgb(180,180,180)";

    let scoreText = "calculating";
    if (score != null) {
        if (score > 0.3 && score < 0.7) scoreText = "neutral";
        else if (score < 0.3) scoreText = "shocked";
        else scoreText = "happy";
    }

    const overallGoodPct = score != null ? clampPct(score * 100) : 0;

    const reactionGif =
        score == null
            ? "/gifs/loading.gif"
            : scoreText === "happy"
                ? "/gifs/bad.gif"
                : scoreText === "shocked"
                    ? "/gifs/good.gif"
                    : "/gifs/neutral.gif";

    const originalWords = tokenize(data.quote.text);
    const finalWords = tokenize(data.text);

    const used = new Set<number>();
    const keepByFinalOrder = finalWords.flatMap((word) => {
        const i = originalWords.findIndex((w, idx) => w === word && !used.has(idx));
        if (i < 0) return [];
        used.add(i);
        return [{ i, word }];
    });

    const keepIndices = keepByFinalOrder.map(({ i }) => i);

    /* ---------------- UI ---------------- */

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="flex flex-col gap-6 w-full max-w-2xl px-4">

                <div className="text-center text-sm text-zinc-500">
                    {score == null ? "Analyzing…" : `Score ready`}
                </div>

                <MisquoteQuoteReveal
                    originalWords={originalWords}
                    keepByFinalOrder={keepByFinalOrder}
                    keepIndices={keepIndices}
                />

                <section className="rounded-2xl border p-6">
                    <p
                        className="text-4xl font-bold"
                        style={{ color: accent }}
                    >
                        {score != null
                            ? `${Math.round(overallGoodPct)}%`
                            : "Calculating…"}
                    </p>

                    <div className="mt-6 space-y-6">
                        <p className="text-sm text-zinc-500">
                            Grammar: {grammarReady ? grammarScore : "loading…"}
                        </p>

                        <p className="text-sm text-zinc-500">
                            Sentiment: {sentimentReady ? sentimentScore : "loading…"}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}