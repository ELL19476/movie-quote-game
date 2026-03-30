"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ClipTimestamp } from "@/lib/stamps";

type VideoSequencerProps = {
    timestamps: ClipTimestamp[];
    playSequence: number[];
    videoSrc: string;
};

const VideoSequencer: React.FC<VideoSequencerProps> = ({ timestamps, playSequence, videoSrc }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequenceIndex, setSequenceIndex] = useState(0);

    // 2. Kontinuierliche Prüfung der Abspielzeit über requestAnimationFrame
    useEffect(() => {
        if (!isPlaying || !videoRef.current || timestamps.length === 0) return;

        let animationFrameId: number;

        const checkVideoTime = () => {
            const video = videoRef.current;
            if (!video) return;

            // Wir ziehen 1 ab, da deine Liste 1-basiert ist (1. Element = Index 0)
            const currentClipIndex = playSequence[sequenceIndex];
            const currentClip = timestamps[currentClipIndex];

            console.log(currentClipIndex, currentClip);

            if (currentClip && video.currentTime >= currentClip.end) {
                // Haben wir das Ende des aktuellen Clips erreicht?
                const nextSequenceIndex = sequenceIndex + 1;

                if (nextSequenceIndex < playSequence.length) {
                    // Springe zum nächsten Clip in der Sequenz
                    const nextClipIndex = playSequence[nextSequenceIndex];
                    const nextClip = timestamps[nextClipIndex];

                    if (nextClip) {
                        video.currentTime = nextClip.start;
                        setSequenceIndex(nextSequenceIndex);
                    }
                } else {
                    // Sequenz beendet
                    video.pause();
                    setIsPlaying(false);
                    return;
                }
            }

            // Loop am Laufen halten
            animationFrameId = requestAnimationFrame(checkVideoTime);
        };

        animationFrameId = requestAnimationFrame(checkVideoTime);

        // Cleanup beim Unmounten oder State-Wechsel
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, sequenceIndex, timestamps]); // eslint-disable-line react-hooks/exhaustive-deps

    // 3. Funktion zum Starten der Sequenz
    const handleStartSequence = () => {
        if (timestamps.length === 0 || !videoRef.current) {
            alert("Timestamps werden noch geladen oder Video fehlt!");
            return;
        }

        setSequenceIndex(0);
        setIsPlaying(true);

        const firstClipIndex = playSequence[0];
        if (timestamps[firstClipIndex]) {
            videoRef.current.currentTime = timestamps[firstClipIndex].start;
            videoRef.current.play();
        }
    };

    return (
        <div className="flex flex-col gap-4 max-w-[600px]">
            {/* VIDEO WRAPPER */}
            <div className="relative w-full overflow-hidden rounded-xl bg-black group">
                <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    className="block w-full h-auto"
                />

                {/* OVERLAY */}
                {!isPlaying && (
                    <div
                        onClick={handleStartSequence}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                    >
                        {/* Play Button */}
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/90 text-black text-2xl shadow-lg transition-transform group-hover:scale-110">
                            ▶
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoSequencer;
