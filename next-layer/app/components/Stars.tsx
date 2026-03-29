
export function Stars({ value }: { value: number }) {
    const fullStars = Math.floor(value);
    const hasHalf = value - fullStars >= 0.5;

    return (
        <div className="flex gap-0.5 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => {
                if (i < fullStars) {
                    return <span key={i}>★</span>;
                }

                if (i === fullStars && hasHalf) {
                    return <span key={i}>⯨</span>;
                }

                return <span key={i} className="text-zinc-400">★</span>;
            })}
        </div>
    );
}