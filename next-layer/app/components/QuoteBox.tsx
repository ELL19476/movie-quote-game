"use client";

import { useMemo, useState } from "react";

type QuoteBoxProps = {
    quote: string;
    onSubmit?: (tokens: string[], result: { input: string; score: number }) => void;
};

function tokenize(text: string) {
    return text.match(/[\w’']+|[.,!?;:]/g) ?? [];
}

function norm(token: string) {
    return token.toLowerCase();
}

export default function QuoteBox({ quote, onSubmit }: QuoteBoxProps) {
    const tokens = useMemo(() => tokenize(quote), [quote]);

    const limitMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const t of tokens) {
            const key = norm(t);
            map.set(key, (map.get(key) || 0) + 1);
        }
        return map;
    }, [tokens]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ score: number } | null>(null);

    const inputTokens = useMemo(
        () => (input.trim() ? tokenize(input) : []),
        [input]
    );

    const isValid = useMemo(() => {
        const used = new Map<string, number>();

        for (const t of inputTokens) {
            const key = norm(t);

            const next = (used.get(key) || 0) + 1;
            if (next > (limitMap.get(key) || 0)) return false;

            used.set(key, next);
        }

        return true;
    }, [inputTokens, limitMap]);

    const selectedIndices = useMemo(() => {
        const used = new Map<string, number>();
        const indices: number[] = [];

        for (const t of inputTokens) {
            const key = norm(t);
            const count = (used.get(key) || 0) + 1;
            used.set(key, count);

            let seen = 0;

            for (let i = 0; i < tokens.length; i++) {
                if (norm(tokens[i]) === key) {
                    seen++;
                    if (seen === count) {
                        indices.push(i);
                        break;
                    }
                }
            }
        }

        return indices;
    }, [inputTokens, tokens]);

    const isSelected = (index: number) =>
        selectedIndices.includes(index);

    const handleTokenClick = (token: string) => {
        setInput((prev) => {
            const current = prev.trim() ? tokenize(prev) : [];
            const key = norm(token);

            const idx = current.findIndex((t) => norm(t) === key);

            if (idx !== -1) current.splice(idx, 1);
            else current.push(token);

            return current.join(" ");
        });
    };

    const handleSubmit = async () => {
        if (!isValid || loading) return;

        setLoading(true);

        const text = inputTokens.join(" ");

        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: text }),
            });

            const data = await res.json();

            setResult(data);

            onSubmit?.(inputTokens, data);
        } catch (err) {
            console.error("submit failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-2xl gap-8 text-lg">
            {/* tokens */}
            <div className="flex flex-wrap gap-3">
                {tokens.map((token, index) => {
                    const active = isSelected(index);

                    return (
                        <button
                            key={index}
                            onClick={() => handleTokenClick(token)}
                            className={`text-lg transition ${
                                active
                                    ? "px-4 py-2 rounded-xl bg-green-300 dark:bg-green-800 text-green-900 dark:text-green-100"
                                    : "underline decoration-transparent hover:decoration-current"
                            }`}
                        >
                            {token}
                        </button>
                    );
                })}
            </div>

            {/* input */}
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or click words..."
                className={`w-full rounded-2xl border px-6 py-4 text-lg bg-transparent outline-none transition
                ${
                    isValid
                        ? "border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-black dark:focus:ring-white"
                        : "border-red-500 focus:ring-2 focus:ring-red-500"
                }`}
            />

            {!isValid && (
                <div className="text-base text-red-500">
                    Invalid: token used more times than allowed.
                </div>
            )}

            {result && (
                <div className="text-base text-zinc-600 dark:text-zinc-300">
                    Score: {result.score}
                </div>
            )}

            {/* actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || loading}
                    className={`text-base px-5 py-2 rounded-xl transition
                    ${
                        isValid && !loading
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                    }`}
                >
                    {loading ? "Checking..." : "Submit"}
                </button>

                <button
                    onClick={() => {
                        setInput("");
                        setResult(null);
                    }}
                    className="text-base text-zinc-500 hover:text-black dark:hover:text-white"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}