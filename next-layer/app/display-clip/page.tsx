import { readFileSync } from "fs";
import path from "path";
import VideoSequencer from "../components/VideoPlayer";
import { clipTimestampsFromText } from "@/lib/stamps";

export default function DisplayClipPage() {
  const stampPath = path.join(process.cwd(), "public", "timestamps", "stamps_1");
  const raw = readFileSync(stampPath, "utf-8");
  const timestamps = clipTimestampsFromText(raw);

  return (
    <div className="h-screen w-full bg-black">
      <VideoSequencer timestamps={timestamps} />
    </div>
  );
}
