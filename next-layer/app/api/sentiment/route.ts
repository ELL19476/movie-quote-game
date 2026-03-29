// Body json input
export type ScoreRequest = {
    text: string
}

// Response type
export type ScoreResponse = {
    input: string
    score: number // -1 to 1
}

export async function POST(request: Request): Promise<Response> {
    const body: ScoreRequest = await request.json()

    const response: ScoreResponse = {
        input: body.text,
        score: 0
    }

    return Response.json(response)
}