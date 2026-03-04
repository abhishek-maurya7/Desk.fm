import { RoomInviteSection } from "@/components/molecules";
import { AddTrackToQueueForm, Player, RoomQueue } from "@/components/organisms";

export default async function RoomPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <main className="space-y-6">
      <section>
        <RoomInviteSection />
      </section>
      <section>
        <div className="w-full max-w-xl mx-auto">
            <Player />
        </div>
      </section>
       <section>
        <div className="mb-6 flex justify-between items-end">
          <h3 className="text-gray-400">
            Your
            <span className="text-5xl leading-none block text-white">
              Queue
            </span>
          </h3>
          <div className="text-white w-1/2">
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
