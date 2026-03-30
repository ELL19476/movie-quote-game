import { getAllScores } from "../ScoresStore";

export async function GET() {
    return Response.json(getAllScores());
}