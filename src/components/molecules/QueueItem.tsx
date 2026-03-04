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
          <Typography
            variant="bodySmall"
            as="span"
            className="text-zinc-400 font-medium mt-auto mb-1"
          >
            {String(index).padStart(2, "0")}
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 aspect-square rounded-md overflow-hidden relative">
            <Image
              src={item.track.thumbnail}
              alt={item.track.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <Typography variant="bodySmall" as="h3" className="line-clamp-1">
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
