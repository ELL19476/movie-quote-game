// app/misquotes/[id]/page.tsx

import MisquoteClient from "./MisquoteClient";
import { ScoreEntry } from "../../api/submit/route";

async function getScore(id: string): Promise<ScoreEntry | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/score/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
}

export default async function Page({
    params,
}: {
    params: { id: string };
}) {
    const data = await getScore((await params).id);

    return <MisquoteClient id={(await params).id} initialData={data} />;
}