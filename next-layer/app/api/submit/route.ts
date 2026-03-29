export async function POST(request: Request) {
    const body = await request.json();
    const text = (body.text || "").replace(/\s+([,.!?;])/g, "$1").trim();

    try {
        const checklangRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/checklang`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        const data = await checklangRes.json();

        return Response.json(data);
    } catch (err) {
        console.error("Submit error:", err);

        return Response.json(
            { error: "Failed to process submission" },
            { status: 500 }
        );
    }
}