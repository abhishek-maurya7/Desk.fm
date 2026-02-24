import Image from "next/image";
import { Typography } from "@/components/atoms";

export default function QueueItem({ item }: { item }) {
  return (
    <li>
      <div className="flex items-center gap-2 bg-red-900 p-2 rounded-md">
        <Image src={item.track.thumbnail} alt={item.track.title} width={48} height={48} />
        <div>
          <Typography variant="bodySmall" as="h3">{item.track.title}</Typography>
          <Typography variant="bodySmall">{item.track.publisher}</Typography>
        </div>
        <div className="ml-auto">added by {item.addedBy}</div>
      </div>
    </li>
  );
}
