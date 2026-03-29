"use client";

import QuoteBox from "./components/QuoteBox";
import { Quote } from "./types/Quote";

export default function QuoteClient({ quote }: { quote: Quote }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900 p-6">
            <div className="w-full max-w-2xl text-center space-y-8">

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                    Ruthlessly misquote this movie character
                </h1>

                <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">
                    Make them seem like the most evil person in the world.
                    
                </p>

                <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-6 md:p-10 transition">
                    <QuoteBox quote={quote} />
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-medium hover:scale-[1.02] active:scale-95 transition"
                >
                    New Quote
                </button>
            </div>
        </div>
    );
}