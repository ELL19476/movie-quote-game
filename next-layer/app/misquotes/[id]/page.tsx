import MisquoteQuoteReveal from "@/app/components/MisquoteQuoteReveal";
import { peekScore } from "../../api/ScoresStore";
import MisquoteScoreLayout from "./MisquoteScoreLayout";
import DisplayClip from "../../components/DisplayClip";
import { findWordInTimestampFileByID } from "../../../lib/stamps";

function tokenize(text: string): string[] {
    return text.match(/[\w’']+|[.,!?;:]/g) ?? [];
}

export default async function MisquotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;
    const entry = peekScore(id);

    if (!entry) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500">
                Not found
            </div>
        );
    }

    const originalWords = tokenize(entry.quote.text);
    const finalWords = tokenize(entry.text);

    const playSequence: number[] = [];

    for (const word of finalWords) {
        try {
            const idx = findWordInTimestampFileByID(entry.quote.id, word);

            // avoid duplicates if same word appears multiple times
            if (playSequence[playSequence.length - 1] !== idx) {
                playSequence.push(idx);
            }
        } catch {
            // ignore words not found in timestamp file
        }
    }

    const used = new Set<number>();
    const keepByFinalOrder = finalWords.flatMap((word) => {
        const i = originalWords.findIndex((w, idx) => w.toLowerCase() === word.toLowerCase() && !used.has(idx));
        if (i < 0) return [];
        used.add(i);
        return [{ i, word }];
    });
    const keepIndices = keepByFinalOrder.map(({ i }) => i);
    return (
        <>
            <DisplayClip id={entry.quote.id} playSequence={playSequence} />
            <MisquoteScoreLayout id={id}>
                <MisquoteQuoteReveal
                    originalWords={originalWords}
                    keepByFinalOrder={keepByFinalOrder}
                    keepIndices={keepIndices} />
            </MisquoteScoreLayout>
        </>
    );
}
