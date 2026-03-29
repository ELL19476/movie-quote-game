import { NextRequest } from "next/server";
import { getRankForId, getScore } from "../../ScoresStore";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const entry = await getScore(id);

    if (!entry) {
        return Response.json(
            { error: "Not found" },
            { status: 404 }
        );
    }

    return Response.json({
        ...entry,
        rank: getRankForId(id),
    });
}