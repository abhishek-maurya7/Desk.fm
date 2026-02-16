import { MongoClient } from "mongodb";

if (typeof window !== "undefined") {
  throw new Error("MongoClient should never be initialized in the browser!");
}

const uri: string | undefined = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

let client: MongoClient;

declare global {
  var _mongoClientGlobal: MongoClient | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientGlobal) {
    global._mongoClientGlobal = new MongoClient(uri);
  }
  client = global._mongoClientGlobal;
} else {
  client = new MongoClient(uri);
}

export default client;
