"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Quote } from "../types/Quote";
import { error } from "console";

type Result = {
    error?: string; id?: string
}

type QuoteBoxProps = {
    quote: Quote;
    onSubmit?: (
        tokens: string[],
        result: Result
    ) => void;
};

function tokenize(text: string) {
    return text.match(/[\w’']+|[.,!?;:]/g) ?? [];
}

function norm(t: string) {
    return t.toLowerCase();
}

export default function QuoteBox({ quote, onSubmit }: QuoteBoxProps) {
    const tokens = useMemo(() => tokenize(quote.text), [quote]);
    const router = useRouter();

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    // -----------------------------
    // allowed frequency per word
    // -----------------------------
    const limitMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const t of tokens) {
            const k = norm(t);
            map.set(k, (map.get(k) || 0) + 1);
        }
        return map;
    }, [tokens]);

    // -----------------------------
    // input tokens
    // -----------------------------
    const inputTokens = useMemo(
        () => (input.trim() ? tokenize(input) : []),
        [input]
    );

    // -----------------------------
    // validation
    // -----------------------------
    const isValid = useMemo(() => {
        if (inputTokens.length === 0) return false;

        const used = new Map<string, number>();

        for (const t of inputTokens) {
            const k = norm(t);
            const next = (used.get(k) || 0) + 1;

            if (next > (limitMap.get(k) || 0)) return false;

            used.set(k, next);
        }

        return true;
    }, [inputTokens, limitMap]);


    const isEmpty = useMemo(() => {
        if (inputTokens.length === 0) return true;

        return false;
    }, [inputTokens]);

    // -----------------------------
    // map input → quote indices (for highlighting)
    // -----------------------------
    const selectedIndices = useMemo(() => {
        const used = new Map<string, number>();
        const result: number[] = [];

        for (const t of inputTokens) {
            const k = norm(t);
            const occ = (used.get(k) || 0) + 1;
            used.set(k, occ);

            let seen = 0;

            for (let i = 0; i < tokens.length; i++) {
                if (norm(tokens[i]) === k) {
                    seen++;
                    if (seen === occ) {
                        result.push(i);
                        break;
                    }
                }
            }
        }

        return result;
    }, [inputTokens, tokens]);

    const isSelected = (i: number) => selectedIndices.includes(i);

    // -----------------------------
    // click handling (FIXED for duplicates)
    // -----------------------------
    const handleTokenClick = (token: string) => {
        setInput((prev) => {
            const current = tokenize(prev);
            const key = norm(token);

            // count occurrences already in input
            const used = new Map<string, number>();

            for (const t of current) {
                const k = norm(t);
                used.set(k, (used.get(k) || 0) + 1);
            }

            const currentCount = used.get(key) || 0;

            // count occurrences in quote
            let quoteCount = 0;
            for (const t of tokens) {
                if (norm(t) === key) quoteCount++;
            }

            const rebuilt: string[] = [];

            // if we can still add → always add
            if (currentCount < quoteCount) {
                return [...current, token].join(" ");
            }

            // otherwise remove LAST occurrence instead of first
            let removed = false;

            for (let i = current.length - 1; i >= 0; i--) {
                if (!removed && norm(current[i]) === key) {
                    removed = true;
                    continue;
                }
                rebuilt.unshift(current[i]);
            }

            return rebuilt.join(" ");
        });
    };

    // -----------------------------
    // submit
    // -----------------------------
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
                body: JSON.stringify({ quote, text }),
            });

            const data = await res.json();

            if (!res.ok) {
                // propagate backend error
                setResult({ error: data?.error });
            }
            else {
                setResult(data);
                onSubmit?.(inputTokens, data);

                router.push(`/misquotes/${data.id}`);
            }
        } catch (err) {
            throw err
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-2xl gap-8 text-lg">

            {/* QUOTE */}
            <div className="flex flex-wrap gap-3">
                {tokens.map((token, index) => {
                    const active = isSelected(index);

                    return (
                        <button
                            key={index}
                            onClick={() => handleTokenClick(token)}
                            className={`text-lg transition ${active
                                ? "px-4 py-2 rounded-xl bg-green-300 dark:bg-green-800"
                                : "underline decoration-transparent hover:decoration-current"
                                }`}
                        >
                            {token}
                        </button>
                    );
                })}
            </div>
            - {quote.movie}

            {/* INPUT */}
            <input
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or click words..."
                className={`w-full rounded-2xl border px-6 py-4 text-lg bg-transparent outline-none transition ${isValid || isEmpty
                    ? "border-zinc-300 dark:border-zinc-700"
                    : "border-red-500"
                    }`}
            />

            {!isValid && !isEmpty && (
                <div className="text-red-500 text-base">
                    You did not use words from the Quote.
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between">
                <button
                    onClick={() => {
                        setInput("");
                        setResult(null);
                    }}
                >
                    Reset
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={!isValid || loading}
                    className={`px-5 py-2 rounded-xl ${isValid && !loading
                        ? "bg-black text-white"
                        : "bg-zinc-300 text-zinc-500"
                        }`}
                >
                    {loading ? "Checking..." : "Submit"}
                </button>
            </div>

            {result && result.error && (
                <div className="text-zinc-600">
                    Error: {result.error}
                </div>
            )}
        </div>
    );
}