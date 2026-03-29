import Image from "next/image";
import QuoteBox from "./components/QuoteBox";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <QuoteBox quote="I'm gonna make him an offer he can't refuse." />
        </div>
    );
}
