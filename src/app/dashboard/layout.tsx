import RoomsContextProvider from "@/contexts/roomsContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoomsContextProvider>
      <div className="min-h-screen p-4">{children}</div>
    </RoomsContextProvider>
  );
}
