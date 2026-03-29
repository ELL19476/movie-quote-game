import { NextRequest } from "next/server";
import { getRankForId, getScore, peekScore } from "../../ScoresStore";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const entry = await getScore(id);

    if (entry) {
        return Response.json({
            ...entry,
            rank: getRankForId(id),
        });
    }

    if (peekScore(id)) {
        return Response.json(
            { error: "Score not ready yet" },
            { status: 503 }
        );
    }

    return Response.json(
        { error: "Not found" },
        { status: 404 }
    );
}