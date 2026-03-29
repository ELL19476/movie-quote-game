import { InferenceClient } from "@huggingface/inference";

// Body json input
export type ScoreRequest = {
    text: string;
};

// Response type
export type ScoreResponse = {
    input: string;
    score: number; // normalized 0..1 from model's 1..10 rating
};

function clamp(num: number, min: number, max: number) {
    return Math.max(min, Math.min(max, num));
}

export async function POST(request: Request): Promise<Response> {
    let body: ScoreRequest;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
        return Response.json(
            { error: 'Field "text" must be a non-empty string' },
            { status: 400 }
        );
    }

    const token = process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY;
    if (!token) {
        return Response.json(
            {
                error: "Set HF_TOKEN or HUGGINGFACE_API_KEY for Hugging Face Inference API",
            },
            { status: 500 }
        );
    }

    const client = new InferenceClient(token);
    const prompt = `"${text}" Rate this sentence from 1 to 10. How well formed and natural is it? Ignore punctuation. Only return a single integer. Do NOT responde with anything else. "${text}"`;

    try {
        const chatCompletion = await client.chatCompletion({
            model: "meta-llama/Llama-4-Scout-17B-16E-Instruct:groq",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const output = chatCompletion.choices?.[0]?.message?.content ?? "";
        const match = output.match(/\d+/);
        const rawScore = clamp(Number(match?.[0] ?? 1), 1, 10);
        const normalizedScore = Number((rawScore / 10).toFixed(2));

        const response: ScoreResponse = {
            input: text,
            score: normalizedScore,
        };

        return Response.json(response);
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Grammar inference request failed";
        return Response.json({ error: message }, { status: 502 });
    }
}

