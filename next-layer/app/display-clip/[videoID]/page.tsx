import { use } from "react";
import DisplayClip from "@/app/components/DisplayClip";

type PageProps = {
    params: Promise<{
        videoID: string;
    }>;
};

export default function Page({ params }: PageProps) {
    const { videoID } = use(params);

    const id = Number(videoID);

    if (Number.isNaN(id)) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-500 bg-black">
                Invalid video ID
            </div>
        );
    }

    return <DisplayClip id={id} playSequence={[19, 20, 21, 15, 16, 17]} />;
}