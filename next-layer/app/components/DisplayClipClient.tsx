"use client";

import { useRef } from "react";
import VideoSequencer from "./VideoPlayer";

export default function DisplayClipClient({
    videoID,
    playSequence,
    timestamps,
}: any) {
    const scrollDown = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-black">
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
                <VideoSequencer
                    timestamps={timestamps}
                    playSequence={playSequence}
                    videoSrc={`/videos/clip_${videoID}.mp4`}
                />

                <button
                    onClick={scrollDown}
                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition"
                >
                    Scroll down
                </button>
            </div>
        </div>
    );
}