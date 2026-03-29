"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type KeepItem = { i: number; word: string };

export default function MisquoteQuoteReveal({
    originalWords,
    keepByFinalOrder,
    keepIndices,
    step = 0.08,
    fade = 0.5,
}: {
    originalWords: string[];
    keepByFinalOrder: KeepItem[];
    keepIndices: number[];
    step?: number;
    fade?: number;
}) {
    const keepSet = new Set(keepIndices);
    const n = originalWords.length;
    const swapDelayMs = (n * step + fade) * 1000;
    const [swapped, setSwapped] = useState(false);
    const firstRects = useRef<Map<number, DOMRect>>(new Map());
    const origRef = useRef<Map<number, HTMLSpanElement | null>>(new Map());
    const finalRef = useRef<Map<number, HTMLSpanElement | null>>(new Map());

    useEffect(() => {
        const t = window.setTimeout(() => {
            const map = new Map<number, DOMRect>();
            keepByFinalOrder.forEach(({ i }) => {
                const el = origRef.current.get(i);
                if (el) map.set(i, el.getBoundingClientRect());
            });
            firstRects.current = map;
            setSwapped(true);
        }, swapDelayMs);
        return () => clearTimeout(t);
    }, [swapDelayMs, keepByFinalOrder]);

    useLayoutEffect(() => {
        if (!swapped) return;
        const first = firstRects.current;
        keepByFinalOrder.forEach(({ i }) => {
            const el = finalRef.current.get(i);
            if (!el) return;
            const f = first.get(i);
            if (!f) return;
            const last = el.getBoundingClientRect();
            el.style.transform = `translate(${f.left - last.left}px, ${f.top - last.top}px)`;
            el.style.transition = "none";
        });
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                keepByFinalOrder.forEach(({ i }) => {
                    const el = finalRef.current.get(i);
                    if (!el) return;
                    el.style.transition = "transform 0.55s ease";
                    el.style.transform = "translate(0,0)";
                });
            });
        });
    }, [swapped, keepByFinalOrder]);

    const setOrig = (idx: number, el: HTMLSpanElement | null) => {
        if (el) origRef.current.set(idx, el);
        else origRef.current.delete(idx);
    };
    const setFinal = (idx: number, el: HTMLSpanElement | null) => {
        if (el) finalRef.current.set(idx, el);
        else finalRef.current.delete(idx);
    };

    return (
        <div className="text-xl font-medium leading-relaxed">
            {!swapped ? (
                <div>
                    {originalWords.map((w, i) => {
                        const keep = keepSet.has(i);
                        const delay = `${i * step}s`;
                        return (
                            <span
                                key={i}
                                ref={(el) => setOrig(i, el)}
                                style={keep ? undefined : { animationDelay: delay }}
                                className={
                                    keep
                                        ? "mr-1 inline-block"
                                        : "mr-1 inline-block animate-[fadeUnused_.5s_ease_forwards] text-zinc-500 dark:text-zinc-400"
                                }
                            >
                                {w || "\u00A0"}
                            </span>
                        );
                    })}
                </div>
            ) : (
                <div>
                    {keepByFinalOrder.map(({ i, word }) => (
                        <span
                            key={i}
                            ref={(el) => setFinal(i, el)}
                            className="mr-1 inline-block will-change-transform"
                        >
                            {word}
                        </span>
                    ))}
                </div>
            )}
            <style>{`@keyframes fadeUnused { to { opacity: 0; } }`}</style>
        </div>
    );
}
