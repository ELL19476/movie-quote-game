import QuoteClient from "./QuoteClient";
import { getRandomQuoteFromTimestamps } from "@/lib/stamps";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
    const quote = getRandomQuoteFromTimestamps();

    return <QuoteClient quote={quote} />;
}