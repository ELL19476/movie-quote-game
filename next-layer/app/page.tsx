import Image from "next/image";
import QuoteBox from "./components/QuoteBox";
import quotesData from "@/data/quotes.json";
import { Quote } from "./types/Quote";

function getRandomQuote(): Quote {
    const i = Math.floor(Math.random() * quotesData.length);
    return quotesData[i];
}

export default function Home() {
    const quote = getRandomQuote();

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <QuoteBox quote={quote} />
        </div>
    );
}