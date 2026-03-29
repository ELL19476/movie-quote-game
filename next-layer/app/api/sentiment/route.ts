import { InferenceClient } from '@huggingface/inference'

const MODEL = 'valhalla/distilbart-mnli-12-1'
// tasksource/deberta-small-long-nli
const CANDIDATE_LABELS = ['good', 'evil'] as const

// Body json input
export type ScoreRequest = {
    text: string
}

// Response type
export type ScoreResponse = {
    input: string
    score: number // -1 to 1
}

function sentimentScore(
    labels: { label: string; score: number }[]
): number {
    const good = labels.find((r) => r.label === 'good')?.score ?? 0
    const evil = labels.find((r) => r.label === 'evil')?.score ?? 0
    // With default multi_label=false, label probabilities sum to 1 → range is [-1, 1]
    return good - evil
}

export async function POST(request: Request): Promise<Response> {
    let body: ScoreRequest
    try {
        body = await request.json()
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (typeof body.text !== 'string' || !body.text.trim()) {
        return Response.json(
            { error: 'Field "text" must be a non-empty string' },
            { status: 400 }
        )
    }

    const token = process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY
    if (!token) {
        return Response.json(
            {
                error:
                    'Set HF_TOKEN or HUGGINGFACE_API_KEY for Hugging Face Inference API',
            },
            { status: 500 }
        )
    }

    const hf = new InferenceClient(token)

    try {
        const result = await hf.zeroShotClassification({
            model: MODEL,
            inputs: body.text,
            parameters: {
                candidate_labels: [...CANDIDATE_LABELS],
            },
        })

        const response: ScoreResponse = {
            input: body.text,
            score: sentimentScore(result),
        }

        return Response.json(response)
    } catch (err) {
        const message =
            err instanceof Error ? err.message : 'Inference request failed'
        return Response.json({ error: message }, { status: 502 })
    }
}
