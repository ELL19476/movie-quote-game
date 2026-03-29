import { readFileSync } from "fs";
import path from "path";
import VideoSequencer from "../components/VideoPlayer";
import { clipTimestampsFromText } from "@/lib/stamps";
import LazyScorePanel from "./LazyScorePanel";

export default async function DisplayClipPage({
  searchParams,
}: {
  searchParams: Promise<{ scoreId?: string }>;
}) {
  const stampPath = path.join(process.cwd(), "public", "timestamps", "stamps_1");
  const raw = readFileSync(stampPath, "utf-8");
  const timestamps = clipTimestampsFromText(raw);
  const { scoreId } = await searchParams;

  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <VideoSequencer timestamps={timestamps} />
        {scoreId ? (
          <LazyScorePanel scoreId={scoreId} />
        ) : null}
      </div>
    </div>
  );
}
