import { Quote } from "../../types/Quote";

export type ScoreEntry = {
    id: string;

    // original quote shown to user
    quote: Quote;

    // user submitted text (misquote)
    text: string;

    checklang: {imput: string, score: number};
    sentiment: {imput: string, score: number};

    finalScore: number
};

const globalScores = globalThis as unknown as {
    scores?: Map<string, ScoreEntry>;
};

if (!globalScores.scores) {
    globalScores.scores = new Map<string, ScoreEntry>();
}

function generateId() {
    return crypto.randomUUID();
}

export async function POST(request: Request) {
    const body = await request.json();

    const quote = body.quote || "";
    const text = (body.text || "")
        .replace(/\s+([,.!?;])/g, "$1")
        .trim();

    try {
        const checklangRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/checklang`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            }
        );

        const sentimentRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/sentiment`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            }
        );

        const checklangData = await checklangRes.json();
        const sentimentData = await sentimentRes.json();

        const id = generateId();

        const entry: ScoreEntry = {
            id,
            quote, // original
            text,  // misquote
            checklang: checklangData ?? 0,
            sentiment: sentimentData ?? 0,
            finalScore: checklangData.score * sentimentData.score
        };

        globalScores.scores!.set(id, entry);

        return Response.json(entry);
    } catch (err) {
        console.error("Submit error:", err);

        return Response.json(
            { error: "Failed to process submission" },
            { status: 500 }
        );
    }
}