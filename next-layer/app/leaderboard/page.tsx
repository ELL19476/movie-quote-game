import { ScoreEntry } from "../api/submit/route";

const globalScores = globalThis as unknown as {
    scores?: Map<string, ScoreEntry>;
};

export default function LeaderboardPage() {
    const entries = Array.from(globalScores.scores?.values() ?? []);

    const sorted = entries.sort((a, b) => b.finalScore - a.finalScore);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-10 bg-zinc-50 dark:bg-black">
            <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

            <div className="w-full max-w-2xl flex flex-col gap-4">
                {sorted.map((entry, i) => (
                    <div
                        key={entry.id}
                        className="border rounded-xl p-4 bg-white dark:bg-zinc-900"
                    >
                        <div className="flex justify-between">
                            <span className="font-bold">
                                #{i + 1}
                            </span>
                            <span className="text-green-600 font-semibold">
                                {entry.finalScore}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                            {entry.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}