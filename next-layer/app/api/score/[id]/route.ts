import { ScoreEntry } from "../../submit/route";

// TODO: Make this persistent
const globalScores = globalThis as unknown as {
    scores?: Map<string, ScoreEntry>;
};

if (!globalScores.scores) {
    globalScores.scores = new Map();
}

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const entry = globalScores.scores.get((await params).id);

    if (!entry) {
        return Response.json(
            { error: "Not found" },
            { status: 404 }
        );
    }

    return Response.json(entry);
}