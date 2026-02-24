import Image from "next/image";
import { Typography } from "@/components/atoms";

interface Queue {
  track: {
    _id: string;
    trackId: string;
    title: string;
    publisher: string;
    thumbnail: string;
    provider: string;
  };
}

export default function QueueItem({
  item,
  index,
}: {
  item: Queue;
  index: number;
}) {
  return (
    <li>
      <div className="flex items-stretch bg-[#1A1B1E] text-white p-3 rounded-md gap-3">
        <div className="flex flex-col">
          <span className="mt-auto text-xl text-zinc-400 font-medium">
            {String(index).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={item.track.thumbnail}
            alt={item.track.title}
            width={48}
            height={56}
            className="rounded-md"
          />
          <div>
            <Typography variant="bodySmall" as="h3">
              {item.track.title}
            </Typography>
            <Typography variant="bodySmall" className="text-zinc-400">
              {item.track.publisher}
            </Typography>
          </div>
        </div>
      </div>
    </li>
  );
}
