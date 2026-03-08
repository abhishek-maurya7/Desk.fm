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
      <div className="flex items-center bg-[#0F172A] p-2 md:p-4 rounded-lg md:rounded-2xl gap-2 md:gap-4 border border-[#263348]">
        <Typography
          variant="bodyLarge"
          as="span"
          className="font-medium text-slate-400 w-6 text-center shrink-0 mt-auto hidden md:unset"
        >
          {String(index).padStart(2, "0")}
        </Typography>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden relative">
            <Image
              src={item.track.thumbnail}
              alt={item.track.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <Typography
              variant="bodySmall"
              as="h3"
              className="line-clamp-1 text-slate-200 font-medium"
            >
              {item.track.title}
            </Typography>
            <Typography variant="bodySmall" className="text-slate-400">
              {item.track.publisher}
            </Typography>
          </div>
        </div>
      </div>
    </li>
  );
}
