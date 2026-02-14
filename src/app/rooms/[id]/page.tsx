import { notFound } from "next/navigation";

import { auth } from "@/auth";

import { RoomInviteSection } from "@/components/molecules";
import { hasRoomAccess } from "@/lib/mongodb/helpers";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id: roomId } = await params;
  const session = await auth();

  const userId = session?.user?.id;

  if (!roomId || !userId) {
    return notFound();
  }

  const hasAccess = await hasRoomAccess(roomId, userId);

  if (!hasAccess) {
     throw notFound();
  }

  return (
    <main>
      <section id="invite">
        <RoomInviteSection />
      </section>
    </main>
  );
}
