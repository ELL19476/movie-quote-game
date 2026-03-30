import { readFileSync } from "fs";
import path from "path";
import { clipTimestampsFromText } from "@/lib/stamps";
import DisplayClipClient from "./DisplayClipClient";

type DisplayClipProps = {
    id: number;
    playSequence: number[];
};

export default function DisplayClip({ id, playSequence }: DisplayClipProps) {
    console.log("id", id)
    const stampPath = path.join(
        process.cwd(),
        "public",
        "timestamps",
        "clip_" + id + ".json"
    );

    const raw = readFileSync(stampPath, "utf-8");
    const timestamps = clipTimestampsFromText(raw);

    console.log(timestamps);
    console.log(playSequence);

    return (
        <DisplayClipClient
            videoID={id}
            playSequence={playSequence}
            timestamps={timestamps}
        />
    );
}