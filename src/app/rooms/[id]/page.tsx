import { Typography } from "@/components/atoms";
import { RoomInviteSection } from "@/components/molecules";
import { AddTrackToQueueForm, Player, RoomQueue } from "@/components/organisms";

export default async function RoomPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <main className="space-y-6">
      <section>
        <RoomInviteSection roomId={id} />
      </section>
      <section>
        <div className="w-full max-w-xl mx-auto">
          <Player />
        </div>
      </section>
      <section>
        <div className="mb-6 flex justify-between items-center">
          <Typography as="h3" variant="h3">
            <Typography as="span" variant="bodyMedium" className="block leading-normal -mb-2">
              Your
            </Typography>
            <Typography as="span" className="text-4xl">
              Queue
            </Typography>
          </Typography>
          <div className="w-1/2">
            <AddTrackToQueueForm roomId={id} />
          </div>
        </div>
        <ul className="grid gap-4 lg:grid-cols-2 lg:[&>li:first-child]:col-span-2">
          <RoomQueue />
        </ul>
      </section>
    </main>
  );
}
