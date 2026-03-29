import Link from "next/link";
import { ScoreEntry } from "../api/submit/route";
import { getAllScores } from "../api/ScoresStore";
import { Stars } from "../components/Stars";

function getStars(score: number) {
    const normalized = Math.max(0, Math.min(5, score * 5));
    return normalized;
}

export default function LeaderboardPage() {
    const entries = getAllScores()
        .filter((entry): entry is ScoreEntry & { finalScore: number } =>
            typeof entry.finalScore === "number"
        );

    const sorted = entries.sort((a, b) => a.finalScore - b.finalScore);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-10 bg-zinc-50 dark:bg-black">
            <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

            <div className="w-full max-w-2xl flex flex-col gap-4">
                {sorted.map((entry, i) => (
                    <Link
                        key={entry.id}
                        href={`/misquotes/${entry.id}`}
                        className="block p-4 hover:shadow-md hover:scale-[1.01] transition outline-none focus:outline-none bg-white/70 dark:bg-zinc-800/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl"
                    >
                        <div className="flex justify-end items-center gap-2">
                            <span className="font-semibold">
                                {entry.finalScore.toFixed(2)}
                            </span>
                            <Stars value={getStars(entry.finalScore)} />
                        </div>

                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                            {entry.text}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}