"use client"

import type { Metadata } from "next";
import DisplayClipCanvas from "./DisplayClipCanvas";
import VideoSequencer from '../components/VideoPlayer.tsx'; 


export default function DisplayClipPage() {
    return (
        <div className="h-screen w-full bg-black">
		<VideoSequencer />	
        </div>
    );
}
