import { NextRequest } from "next/server";
import { ScoreEntry } from "../../submit/route";

// TODO: Make this persistent
const globalScores = globalThis as unknown as {
    scores?: Map<string, ScoreEntry>;
};


export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    if (!globalScores.scores) {
        globalScores.scores = new Map();
    }

    const entry = globalScores.scores.get((await context.params).id);

    if (!entry) {
        return Response.json(
            { error: "Not found" },
            { status: 404 }
        );
    }

    return Response.json(entry);
}