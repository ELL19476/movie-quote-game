"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ScoreEntry } from "../../api/submit/route";
import NewQuoteButton from "../../components/NewQuote";

type ScorePayload = ScoreEntry & { rank?: number };

function ordinal(n: number) {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return `${n}st`;
    if (j === 2 && k !== 12) return `${n}nd`;
    if (j === 3 && k !== 13) return `${n}rd`;
    return `${n}th`;
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

function ScoreBreakdownBar({
    label,
    zero,
    one,
    valuePct,
}: {
    label: string;
    zero: string;
    one: string;
    valuePct: number;
}) {
    const v = clampPct(valuePct);
    const barColor = colorForPercent(v);
    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-medium text-zinc-800 dark:text-zinc-100">{label}</span>
                <span className="text-[15px] font-semibold tabular-nums" style={{ color: barColor }}>
                    {Math.round(v)}%
                </span>
            </div>
            <div
                className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800/90 ring-1 ring-inset ring-black/5 dark:ring-white/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(v)}
                aria-label={`${label}: ${Math.round(v)} percent toward good`}
            >
                <div
                    className="h-full rounded-full shadow-inner"
                    style={{
                        width: `${v}%`,
                        backgroundColor: barColor,
                    }}
                />
            </div>
            <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <span>{zero}</span>
                <span>{one}</span>
            </div>
        </div>
    );
}

function TitleSkeleton() {
    return (
        <div className="h-24 w-full animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80" aria-hidden />
    );
}

function RingSkeleton() {
    return (
        <div className="relative mx-auto -mt-10 h-[264px] w-[264px] shrink-0">
            <div className="mx-auto h-full w-full animate-pulse rounded-full bg-zinc-200/80 dark:bg-zinc-800/80" />
        </div>
    );
}

function ScoreSectionSkeleton() {
    return (
        <section
            className="rounded-2xl border border-zinc-200/90 bg-white/70 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
            aria-busy
            aria-label="Loading score"
        >
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-4 h-10 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-6 space-y-6 border-t border-zinc-200/90 pt-6 dark:border-zinc-800">
                <div className="h-3 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
        </section>
    );
}

export default function MisquoteScoreLayout({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const [data, setData] = useState<ScorePayload | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setData(null);
        setError(null);

        const url = `/api/score/${encodeURIComponent(id)}`;

        async function load() {
            while (!cancelled) {
                const res = await fetch(url, { cache: "no-store" });
                if (res.ok) {
                    const payload = (await res.json()) as ScorePayload;
                    if (!cancelled) setData(payload);
                    return;
                }
                if (res.status === 503) {
                    await new Promise((r) => setTimeout(r, 250));
                    continue;
                }
                if (res.status === 404) {
                    if (!cancelled) setError("Not found");
                    return;
                }
                if (!cancelled) setError("Failed to load score");
                return;
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const loading = data === null && !error;

    if (error) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="flex w-full max-w-2xl flex-col gap-6 px-4">
                    <p className="text-center text-red-500" role="alert">
                        {error}
                    </p>
                    {children}
                </div>
            </div>
        );
    }

    const score = data?.finalScore ? data.finalScore : 0;
    const pct = score * 100;
    const accent = data ? colorForPercent(pct) : "#888";

    let scoreText = "neutral";
    if (data) {
        if (score > 0.3 && score < 0.7) scoreText = "neutral";
        else if (score >= 0.7) scoreText = "shocked";
        else scoreText = "happy";
    }

    const ringR = 44;
    const ringC = 2 * Math.PI * ringR;
    const ringOffset = ringC * (1 - score);

    const overallGoodPct = data ? clampPct(score * 100) : 0;
    const grammarPct = data ? clampPct((data.checklang?.score ?? 0) * 100) : 0;
    const sentimentPct = data
        ? clampPct((data.sentiment?.score ?? 0) * 100)
        : 0;

    const reactionGif =
        scoreText === "happy"
            ? "/gifs/bad.gif"
            : scoreText === "shocked"
                ? "/gifs/good.gif"
                : "/gifs/neutral.gif";

    const place = data?.rank ?? null;

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="flex w-full max-w-2xl flex-col gap-6 px-4">
                <div className="w-full">
                    {loading ? (
                        <TitleSkeleton />
                    ) : (
                        <svg viewBox="0 0 600 140" className="h-24 w-full">
                            <path id="title-curve" d="M 80 110 Q 300 10 520 110" fill="transparent" />
                            <text className="text-[32px] font-semibold" fill={accent}>
                                <textPath href="#title-curve" startOffset="50%" textAnchor="middle">
                                    The public was {scoreText}.
                                </textPath>
                            </text>
                        </svg>
                    )}
                </div>

                {loading ? (
                    <RingSkeleton />
                ) : (
                    <div className="relative mx-auto -mt-10 h-[264px] w-[264px] shrink-0">
                        <svg
                            className="absolute inset-0 h-full w-full -rotate-90 drop-shadow-[0_0_12px_rgba(0,0,0,0.15)]"
                            viewBox="0 0 100 100"
                            aria-hidden
                        >
                            <defs>
                                <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <circle
                                cx="50"
                                cy="50"
                                r={ringR}
                                fill="none"
                                className="stroke-zinc-200 dark:stroke-zinc-700"
                                strokeWidth="5"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r={ringR}
                                fill="none"
                                stroke={accent}
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray={ringC}
                                strokeDashoffset={ringOffset}
                                filter="url(#ring-glow)"
                            />
                        </svg>
                        <div className="absolute inset-[12px] overflow-hidden rounded-full ring-2 ring-black/5 dark:ring-white/10">
                            <img
                                src={reactionGif}
                                alt={`${scoreText} reaction`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {children}

                {loading ? (
                    <ScoreSectionSkeleton />
                ) : (
                    <section
                        className="rounded-2xl border border-zinc-200/90 bg-white/70 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
                        aria-labelledby="score-heading"
                    >
                        <h2
                            id="score-heading"
                            className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
                        >
                            Score
                        </h2>
                        <p
                            className="mt-2 text-4xl font-bold tabular-nums tracking-tight"
                            style={{ color: colorForPercent(overallGoodPct) }}
                        >
                            {Math.round(overallGoodPct)}%
                        </p>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Combined grammar and sentiment (higher is better)
                        </p>

                        <div className="mt-6 border-t border-zinc-200/90 pt-6 dark:border-zinc-800">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                                Breakdown
                            </h3>
                            <div className="mt-5 space-y-8">
                                <ScoreBreakdownBar label="Grammar" zero="Bad" one="Good" valuePct={grammarPct} />
                                <ScoreBreakdownBar label="Sentiment" zero="Good" one="Evil" valuePct={sentimentPct} />
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {!loading && place != null && (
                <p className="fixed bottom-6 right-6 max-w-sm text-right text-sm text-zinc-600 dark:text-zinc-400">
                    This makes you{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{ordinal(place)} place</span>{" "}
                    on the{" "}
                    <Link
                        href="/leaderboard"
                        className="font-semibold text-green-600 underline decoration-green-600/40 underline-offset-2 hover:text-green-500 dark:text-green-400"
                    >
                        leaderboard
                    </Link>

                    <div className="p-4">
                        <NewQuoteButton />
                    </div>
                </p>


            )}
        </div>
    );
}
