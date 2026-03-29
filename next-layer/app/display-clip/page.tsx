import type { Metadata } from "next";
import DisplayClipCanvas from "./DisplayClipCanvas";

export const metadata: Metadata = {
    title: "Display clip",
    description: "Three.js scene with GLTF model",
};

export default function DisplayClipPage() {
    return (
        <div className="h-screen w-full bg-black">
            <DisplayClipCanvas />
        </div>
    );
}
