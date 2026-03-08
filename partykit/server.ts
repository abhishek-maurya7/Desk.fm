import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(
      JSON.stringify({
        type: "CONNECTED",
        payload: {
          roomId: this.room.id,
          connectionId: conn.id,
        },
      })
    );
  }

  onMessage(message: string) {
    try {
      const data = JSON.parse(message);

      const exclude: string[] = [];

      if (data.senderConnectionId) {
        exclude.push(data.senderConnectionId);
      }

      this.room.broadcast(message, exclude);
    } catch {
      console.warn("[PartyKit] Failed to parse message");
      this.room.broadcast(message);
    }
  }
}

Server satisfies Party.Worker;