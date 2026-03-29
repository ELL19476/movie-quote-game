import { ScoreEntry } from "../../api/submit/route";
import Link from "next/link";

async function getScore(id: string): Promise<ScoreEntry | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/score/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
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

    const score = ((data.sentiment.score + 1) / 2 ) * 0.8 + (data.checklang.score / 2) * 0.2;
    var scoreText = "";
    var scoreColor = "";
    if (score > 0.3 && score < 0.7) {
        scoreText = "neutral";
        scoreColor = "fill-zinc-500";
    } else if (score < 0.3) {
        scoreText = "shocked";
        scoreColor = "fill-green-500";
    } else {
        scoreText = "happy";
        scoreColor = "fill-red-500";
    }
    const reactionGif =
        scoreText === "happy"
            ? "/gifs/bad.gif"
            : scoreText === "shocked"
              ? "/gifs/good.gif"
              : "/gifs/neutral.gif";
    const originalWords = data.quote.text.split(" ");
    const finalWords = data.text.split(" ");
    const n = originalWords.length;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="flex flex-col gap-6 w-full max-w-2xl">
                <div className="w-full">
                    <svg viewBox="0 0 600 140" className="h-24 w-full">
                        <path id="title-curve" d="M 80 110 Q 300 10 520 110" fill="transparent" />
                        <text className={`text-[32px] font-semibold ${scoreColor}`}>
                            <textPath href="#title-curve" startOffset="50%" textAnchor="middle">
                                The public was {scoreText}.
                            </textPath>
                        </text>
                    </svg>
                </div>
                <div className="mx-auto h-60 w-60 overflow-hidden rounded-full border-4 border-zinc-300 dark:border-zinc-700 -mt-10">
                    <img
                        src={reactionGif}
                        alt={`${scoreText} reaction`}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="text-xl font-medium leading-relaxed">
                    {Array.from({ length: n }, (_, i) => {
                        const keep = originalWords.findIndex(word => word === finalWords[i]) !== -1;
                        const delay = `${i * 0.08}s`;
                        return (
                            <span
                                key={i}
                                style={keep ? undefined : { animationDelay: delay }}
                                className={
                                    keep
                                        ? "mr-1 inline-block"
                                        : "mr-1 inline-block animate-[fadeUnused_.5s_ease_forwards] text-zinc-500 dark:text-zinc-400"
                                }
                            >
                                {finalWords[i] || "\u00A0"}
                            </span>
                        );
                    })}
                </div>

                {/* score */}
                <div className="text-lg">
                    Score:{" "}
                    <span className="font-bold">
                        {score}
                    </span>
                </div>
                <Link
                    href="/leaderboard"
                    className="mt-4 inline-block text-center px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black"
                >
                    View Leaderboard
                </Link>
            </div>
            <style>{`@keyframes fadeUnused { to { opacity: 0; } }`}</style>
        </div>
    );
}