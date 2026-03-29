"use client";

import { useState } from "react";

type QuoteBoxProps = {
    quote: string;
};

export default function QuoteBox({ quote }: QuoteBoxProps) {
    // split into words + punctuation tokens
    const tokens = quote.match(/[\w’']+|[.,!?;:]/g) ?? [];

    const [selected, setSelected] = useState<number[]>([]);

    const isSelected = (index: number) => selected.includes(index);

    const handleClick = (index: number) => {
        setSelected((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index);
            }
            return [...prev, index];
        });
    };

    const selectedText = selected.map((i) => tokens[i]).join(" ");

    return (
        <div className="flex flex-col w-full max-w-md rounded-2xl shadow-lg bg-white dark:bg-zinc-900 p-6 gap-4">
            {/* tokenized quote */}
            <div className="flex flex-wrap gap-2">
                {tokens.map((token, index) => {
                    const active = isSelected(index);

                    return (
                        <button
                            key={index}
                            onClick={() => handleClick(index)}
                            className={`
                                text-sm transition
                                ${
                                    active
                                        ? "px-2 py-1 rounded-lg bg-green-300 dark:bg-green-800 text-green-900 dark:text-green-100"
                                        : "underline decoration-transparent hover:decoration-current"
                                }
                            `}
                        >
                            {token}
                        </button>
                    );
                })}
            </div>

            {/* always visible input */}
            <input
                type="text"
                value={selectedText}
                readOnly
                placeholder="Build the quote..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm"
            />

            {/* reset */}
            <button
                onClick={() => setSelected([])}
                className="self-end text-sm text-zinc-500 hover:text-black dark:hover:text-white"
            >
                Reset
            </button>
        </div>
    );
}