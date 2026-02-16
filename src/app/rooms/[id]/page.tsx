import { Typography } from "@/components/atoms";
import { RoomInviteSection } from "@/components/molecules";
import { AddTrackToQueueForm } from "@/components/organisms";
import { getBaseUrl } from "@/lib/server/helpers";
import { cookies } from "next/headers";
import Image from "next/image";

export default async function RoomPage({ params }) {
  const { id: roomId } = await params;

  const cookieStore = await cookies();

  const baseUrl = await getBaseUrl();

  const response = await fetch(
    `${baseUrl}/api/rooms/${roomId}`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  return (
    <main>
      <section>
        <RoomInviteSection />
      </section>

      <section>
        <AddTrackToQueueForm roomId={roomId} />
      </section>

      <section>
        <ul className="space-y-2">
          {data?.queue.map((queueItem) => (
            <li key={queueItem._id}>
              <div className="flex items-center gap-2 bg-red-900 p-2 rounded-md">
                <div>
                  <Image
                    src={queueItem.track.thumbnail}
                    alt={queueItem.track.title}
                    width={48}
                    height={48}
                    className="rounded-xs"
                  />
                </div>
                <div>
                  <Typography variant="bodySmall" as="h3" className="font-semibold">
                    {queueItem.track.title}
                  </Typography>
                  <Typography variant="bodySmall">
                    {queueItem.track.publisher}
                  </Typography>
                </div>
                <div className="ml-auto">
                  added by {queueItem.addedBy}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
