import RoomContextProvider, {
  RoomState,
} from "@/contexts/roomContext";
import { getBaseUrl } from "@/lib/server/helpers";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = await params;

  const cookieStore = await cookies();
  const baseUrl = await getBaseUrl();

  let roomData: RoomState = {
    _id: "",
    name: "",
    members: [],
    queue: [],
    playbackControllers: [],
  };

  try {
    const response = await fetch(`${baseUrl}/api/rooms/${roomId}`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) notFound();
      redirect("/dashboard");
    }

    roomData = (await response.json()) as RoomState;
  } catch (error) {
    console.error("Failed to fetch or parse room data:", error);
  }

  return (
    <RoomContextProvider initialData={roomData}>
      <div>{children}</div>
    </RoomContextProvider>
  );
}
