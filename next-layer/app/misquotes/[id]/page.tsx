import QuoteBox from "@/app/components/QuoteBox";
import { ScoreEntry } from "../../api/submit/route";

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
    console.log(data)

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500">
                Not found
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="flex flex-col gap-6 w-full max-w-2xl">
                {/* original quote */}
                <div className="text-lg text-zinc-600 dark:text-zinc-300">
                    Original: {data.quote}
                </div>
                <div className="text-xl font-medium">
                    {data.text}
                </div>

                {/* score */}
                <div className="text-lg">
                    Score:{" "}
                    <span className="font-bold">
                        {data.sentiment.score} {data.checklang.score}
                    </span>
                </div>
            </div>
        </div>
    );
}