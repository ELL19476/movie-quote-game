import MisquoteQuoteReveal from "@/app/components/MisquoteQuoteReveal";
import { peekScore } from "../../api/ScoresStore";
import MisquoteScoreLayout from "./MisquoteScoreLayout";

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
  const used = new Set<number>();
  const keepByFinalOrder = finalWords.flatMap((word) => {
    const i = originalWords.findIndex((w, idx) => w === word && !used.has(idx));
    if (i < 0) return [];
    used.add(i);
    return [{ i, word }];
  });
  const keepIndices = keepByFinalOrder.map(({ i }) => i);

  return (
    <MisquoteScoreLayout id={id}>
      <MisquoteQuoteReveal
        originalWords={originalWords}
        keepByFinalOrder={keepByFinalOrder}
        keepIndices={keepIndices}
      />
    </MisquoteScoreLayout>
  );
}
