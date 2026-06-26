import dns from "node:dns";
import { Resolver } from "node:dns/promises";
import { MongoClient, type Db } from "mongodb";

dns.setDefaultResultOrder("ipv4first");

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoResolvedUri: string | undefined;
}

const clientOptions = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 15000,
  family: 4,
};

const PUBLIC_DNS = ["8.8.8.8", "8.8.4.4", "1.1.1.1"];

/** Windows/local DNS often blocks SRV — resolve Atlas hosts via public DNS instead. */
async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  const direct = process.env.MONGODB_URI_DIRECT?.trim();
  if (direct) return direct;

  const withoutProtocol = uri.slice("mongodb+srv://".length);
  const qIndex = withoutProtocol.indexOf("?");
  const base = qIndex >= 0 ? withoutProtocol.slice(0, qIndex) : withoutProtocol;
  const query = qIndex >= 0 ? withoutProtocol.slice(qIndex + 1) : "";

  const slashIndex = base.indexOf("/");
  const authHost = slashIndex >= 0 ? base.slice(0, slashIndex) : base;
  const dbPath = slashIndex >= 0 ? base.slice(slashIndex) : "";

  const atIndex = authHost.lastIndexOf("@");
  const clusterHost = atIndex >= 0 ? authHost.slice(atIndex + 1) : authHost;

  const resolver = new Resolver();
  resolver.setServers(PUBLIC_DNS);

  const srvName = `_mongodb._tcp.${clusterHost}`;
  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(srvName),
    resolver.resolveTxt(srvName).catch(() => [] as string[][]),
  ]);

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
  const txtOptions = txtRecords.flat().join("&");

  const params = new URLSearchParams(query);
  if (txtOptions) {
    for (const part of txtOptions.split("&")) {
      const [key, value] = part.split("=");
      if (key && value && !params.has(key)) params.set(key, value);
    }
  }
  if (!params.has("ssl")) params.set("ssl", "true");
  if (!params.has("authSource")) params.set("authSource", "admin");
  if (!params.has("retryWrites")) params.set("retryWrites", "true");
  if (!params.has("w")) params.set("w", "majority");

  const paramStr = params.toString();

  const credAt = authHost.lastIndexOf("@");
  const userPass = credAt >= 0 ? authHost.slice(0, credAt) : "";
  let credPrefix = "";
  if (userPass.includes(":")) {
    const colon = userPass.indexOf(":");
    const user = encodeURIComponent(decodeURIComponent(userPass.slice(0, colon)));
    const pass = encodeURIComponent(decodeURIComponent(userPass.slice(colon + 1)));
    credPrefix = `${user}:${pass}@`;
  }

  return `mongodb://${credPrefix}${hosts}${dbPath}${paramStr ? `?${paramStr}` : ""}`;
}

function resetClientCache() {
  global._mongoClientPromise = undefined;
  global._mongoResolvedUri = undefined;
}

async function connectClient(uri: string): Promise<MongoClient> {
  const resolvedUri = await resolveMongoUri(uri);
  global._mongoResolvedUri = resolvedUri;
  const client = new MongoClient(resolvedUri, clientOptions);
  await client.connect();
  await client.db(process.env.MONGODB_DB_NAME || "portfolio").command({ ping: 1 });
  return client;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connectClient(uri).catch((err) => {
        resetClientCache();
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  return connectClient(uri);
}

export async function getDb(): Promise<Db> {
  try {
    const client = await getClientPromise();
    return client.db(process.env.MONGODB_DB_NAME || "portfolio");
  } catch (error) {
    resetClientCache();
    throw error;
  }
}

function errorText(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  let text = `${error.message} ${(error as NodeJS.ErrnoException).code ?? ""}`;
  if ("cause" in error && error.cause) {
    text += ` ${errorText(error.cause)}`;
  }
  return text.toLowerCase();
}

export function isMongoConnectionError(error: unknown): boolean {
  const text = errorText(error);
  return (
    text.includes("econnrefused") ||
    text.includes("querysrv") ||
    text.includes("server selection") ||
    text.includes("mongoserverselectionerror") ||
    text.includes("mongonetworkerror") ||
    text.includes("topology") ||
    text.includes("ssl") ||
    text.includes("tls") ||
    text.includes("alert internal error") ||
    text.includes("err_ssl") ||
    text.includes("authentication failed") ||
    text.includes("bad auth") ||
    text.includes("enotfound") ||
    text.includes("etimeout") ||
    text.includes("mongodb_uri")
  );
}

export function getMongoErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Unknown database error.";
  const msg = error.message;

  if (msg.includes("querySrv ECONNREFUSED")) {
    return "DNS blocked MongoDB SRV lookup. Restart dev server, or set MONGODB_URI_DIRECT in .env.";
  }
  if (msg.includes("bad auth") || msg.includes("Authentication failed")) {
    return "MongoDB authentication failed. Check username/password in MONGODB_URI.";
  }
  if (msg.includes("Server selection timed out")) {
    return "Cannot reach MongoDB Atlas. Whitelist your IP in Atlas → Network Access → Add Current IP.";
  }
  if (msg.includes("SSL") || msg.includes("tlsv1 alert") || msg.includes("TLSV1_ALERT")) {
    return "MongoDB blocked this IP. Atlas → Network Access → Add Current IP (or 0.0.0.0/0 for dev), wait 2 min, restart server.";
  }
  return msg;
}
