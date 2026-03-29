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
    console.log("getScoreData", data)

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500">
                Not found
            </div>
        );
    }

    const score = data.finalScore;
    
    let scoreText = "";
    let scoreColor = "";
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
                <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-zinc-300 dark:border-zinc-700">
                    <img
                        src={reactionGif}
                        alt={`${scoreText} reaction`}
                        className="h-full w-full object-cover"
                    />
                </div>
                {/* original quote */}
                <div className="text-lg text-zinc-600 dark:text-zinc-300">
                    Original: {data.quote.text}
                </div>
                <div className="text-xl font-medium">
                    {data.text}
                </div>

                {/* score */}
                <div className="text-lg">
                    Score: 
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
        </div>
    );
}