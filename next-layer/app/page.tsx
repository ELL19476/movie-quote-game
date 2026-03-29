import QuoteClient from "./QuoteClient";
import { getRandomQuoteFromTimestamps } from "@/lib/stamps";
import { Quote } from "./types/Quote";

function getRandomQuote(): Quote {
    return getRandomQuoteFromTimestamps();
}

export default function Home() {
    const quote = getRandomQuote(); // SERVER ONLY → safe

    return <QuoteClient quote={quote} />;
}