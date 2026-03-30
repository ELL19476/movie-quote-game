"use client";

import { useRouter } from "next/navigation";

type NewQuoteButtonProps = {
    label?: string;
    className?: string;
};

export default function NewQuoteButton({
    label = "New Quote",
    className
}: NewQuoteButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push("/")}
            className={className ? className : "" + " px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-medium hover:scale-[1.02] active:scale-95 transition"}
        >
            {label}
        </button>
    );
}