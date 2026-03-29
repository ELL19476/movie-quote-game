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
    const body: ScoreRequest = await request.json();
    const text = body.text || "";

    let finalScore = 1; // Start bei perfekt

    if (text.trim().length > 0) {
        try {
            const formData = new URLSearchParams();
            formData.append('text', text);
            formData.append('language', 'en-US');

            const ltResponse = await fetch("https://api.languagetool.org/v2/check", {
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            const data = await ltResponse.json();
            const issueCount = data.matches.length;
            const wordCount = text.trim().split(/\s+/).length;

            const penaltyPerIssue = 0.4;
            finalScore = 1 - (issueCount * penaltyPerIssue);

            finalScore = Math.max(-1, Math.min(1, finalScore));

        } catch (error) {
            console.error("Grammar Check Error:", error);
            finalScore = 0;
        }
    }

    const response: ScoreResponse = {
        input: text,
        score: parseFloat(finalScore.toFixed(2))
    };

    return Response.json(response);
}

