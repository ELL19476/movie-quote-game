import { Quote } from "../../types/Quote";
import { setScore } from "../ScoresStore";

export type ScoreEntry = {
    id: string;

    // original quote shown to user
    quote: Quote;

    // user submitted text (misquote)
    text: string;

    checklang: { imput: string, score: number } | undefined;
    sentiment: { imput: string, score: number } | undefined;

    finalScore: number | undefined
};

function generateId() {
    return crypto.randomUUID();
}

export async function POST(request: Request) {
    const body = await request.json();

    const quote = body.quote || "";
    const text = (body.text || "")
        .replace(/\s+([,.!?;])/g, "$1")
        .trim();

    if (!text || text.length === 0) {
        return Response.json(
            { error: "Text cannot be empty" },
            { status: 400 }
        );
    }

    try {
        const id = generateId();

        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/checklang`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            }).then((r) => r.json()),

            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sentiment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            }).then((r) => r.json()),
        ])
            .then(([checklangData, sentimentData]) => {
                const entry: ScoreEntry = {
                    id,
                    quote,
                    text,
                    checklang: {
                        imput: checklangData.input,
                        score: checklangData.score,
                    },
                    sentiment: {
                        imput: sentimentData.input,
                        score: sentimentData.score,
                    },
                    finalScore: sentimentData.score * 0.8 + checklangData.score * 0.2
                };
                console.log("entry", entry);

                setScore(entry);
            })
            .catch((err) => {
                console.error("Submit error:", err);

                return Response.json(
                    { error: "Failed to process submission" },
                    { status: 500 }
                );
            });

        const entry: ScoreEntry = {
            id,
            quote, // original
            text,  // misquote
            checklang: undefined,
            sentiment: undefined,
            finalScore: undefined
        };

        setScore(entry);

        return Response.json(entry);
    } catch (err) {
        console.error("Submit error:", err);

        return Response.json(
            { error: "Failed to process submission" },
            { status: 500 }
        );
    }
}