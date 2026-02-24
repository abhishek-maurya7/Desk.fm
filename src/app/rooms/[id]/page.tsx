import { RoomInviteSection } from "@/components/molecules";
import { AddTrackToQueueForm, Player, RoomQueue } from "@/components/organisms";

export default async function RoomPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <main>
      <section>
        <RoomInviteSection />
      </section>

      <section>
        <div className="text-white">
          <AddTrackToQueueForm roomId={id} />
        </div>
      </section>
      <section>
        <div className="w-full max-w-xl mx-auto">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
            <Player />
          </div>
        </div>
      </section>
      <section>
        <ul className="space-y-2">
          <RoomQueue />
        </ul>
      </section>
    </main>
  );
}
