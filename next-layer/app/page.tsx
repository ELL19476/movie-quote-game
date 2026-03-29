import QuoteClient from "./QuoteClient";
import { getRandomQuoteFromTimestamps } from "@/lib/stamps";

export default function Home() {
    const quote = getRandomQuoteFromTimestamps();

    return <QuoteClient quote={quote} />;
}