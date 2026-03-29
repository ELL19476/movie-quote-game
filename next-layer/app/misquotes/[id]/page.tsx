import Link from "next/link";
import MisquoteQuoteReveal from "@/app/components/MisquoteQuoteReveal";
import { ScoreEntry } from "../../api/submit/route";

const globalScores = globalThis as unknown as {
    scores?: Map<string, ScoreEntry>;
};

function ordinal(n: number) {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return `${n}st`;
    if (j === 2 && k !== 12) return `${n}nd`;
    if (j === 3 && k !== 13) return `${n}rd`;
    return `${n}th`;
}

/** 0% at score 1, 100% at score 0 — drives ring fill and red→green color */
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
                <span className="text-[15px] font-medium text-zinc-800 dark:text-zinc-100">
                    {label}
                </span>
                <span
                    className="text-[15px] font-semibold tabular-nums"
                    style={{ color: barColor }}
                >
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
                <span>
                    {zero}
                </span>
                <span>
                    {one}
                </span>
            </div>
        </div>
    );
}

async function getScore(id: string): Promise<ScoreEntry | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/score/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
}

function tokenize(text: string): string[] {
    return text.match(/[\w’']+|[.,!?;:]/g) ?? [];
}

export default async function MisquotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const data = await getScore((await params).id);

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500">
                Not found
            </div>
        );
    }

    const score =
        (((data.sentiment?.score ?? 0) + 1) / 2) * 0.8 +
        ((data.checklang?.score ?? 0) / 2) * 0.2;
    const pct = scoreToPercent(score);
    const accent = colorForPercent(pct);

    let scoreText = "";
    if (score > 0.3 && score < 0.7) {
        scoreText = "neutral";
    } else if (score < 0.3) {
        scoreText = "shocked";
    } else {
        scoreText = "happy";
    }

    const entries = Array.from(globalScores.scores?.values() ?? []);
    const sorted = [...entries].sort(
        (a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0)
    );
    const rankIdx = sorted.findIndex((e) => e.id === data.id);
    const place = rankIdx >= 0 ? rankIdx + 1 : null;

    const ringR = 44;
    const ringC = 2 * Math.PI * ringR;
    const ringOffset = ringC * (1 - pct / 100);

    const overallGoodPct = clampPct(score * 100);
    const grammarPct = clampPct((data.checklang?.score ?? 0) * 100);
    const sentimentPct = clampPct(
        (((data.sentiment?.score ?? 0) + 1) / 2) * 100
    );
    const reactionGif =
        scoreText === "happy"
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

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="flex flex-col gap-6 w-full max-w-2xl px-4">
                <div className="w-full">
                    <svg viewBox="0 0 600 140" className="h-24 w-full">
                        <path id="title-curve" d="M 80 110 Q 300 10 520 110" fill="transparent" />
                        <text
                            className="text-[32px] font-semibold"
                            fill={accent}
                        >
                            <textPath href="#title-curve" startOffset="50%" textAnchor="middle">
                                The public was {scoreText}.
                            </textPath>
                        </text>
                    </svg>
                </div>
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
                <MisquoteQuoteReveal
                    originalWords={originalWords}
                    keepByFinalOrder={keepByFinalOrder}
                    keepIndices={keepIndices}
                />

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
                            <ScoreBreakdownBar label="Sentiment" zero="Evil" one="Good" valuePct={sentimentPct} />
                        </div>
                    </div>
                </section>
            </div>

            {place != null && (
                <p className="fixed bottom-6 right-6 max-w-sm text-right text-sm text-zinc-600 dark:text-zinc-400">
                    This makes you{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {ordinal(place)} place
                    </span>{" "}
                    on the{" "}
                    <Link
                        href="/leaderboard"
                        className="font-semibold text-green-600 underline decoration-green-600/40 underline-offset-2 hover:text-green-500 dark:text-green-400"
                    >
                        leaderboard
                    </Link>
                    .
                </p>
            )}
        </div>
    );
}