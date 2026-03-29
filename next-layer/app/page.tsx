import QuoteClient from "./QuoteClient";
import quotesData from "@/data/quotes.json";
import { Quote } from "./types/Quote";

function getRandomQuote(): Quote {
    const i = Math.floor(Math.random() * quotesData.length);
    return quotesData[i];
}

export default function Home() {
    const quote = getRandomQuote(); // SERVER ONLY → safe

    return <QuoteClient quote={quote} />;
}