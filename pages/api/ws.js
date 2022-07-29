import { Boom } from "@hapi/boom";
import { Server } from "socket.io";
import fs from "fs";
import P from "pino";
import makeWASocket, {
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
  BufferJSON,
} from "@adiwajshing/baileys";
import { isset, empty } from "../../utils/common";
import Binance from "node-binance-api";

process.on("unhandledRejection", console.log);

const binance = new Binance();
const __debug = true;
const folderStore = "./temp/cache/whatsapp/";
let filenameStore = "baileys_store_multi";

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({
  //logger: P().child({ level: "debug", stream: "store" }),
});
//TODO: use env vars to set folders 
store.readFromFile(folderStore + filenameStore +".json");
// save every 10s
let __i = setInterval(() => {
  store.writeToFile(folderStore + filenameStore +".json");
}, 10_000);

const sendToClient = async (event, msg, ws_client) => {
  if (!ws_client) return false;

  ws_client?.broadcast?.emit(
    event,
    JSON.stringify({
      data: msg
    })
  );
};

// start a connection
const startSock = async (ws_client, __filenameStore) => {
  const f = !empty(__filenameStore) ? filenameStore : filenameStore;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { state, saveCreds } = await useMultiFileAuthState(
    folderStore + f
  );

  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  if (__debug)
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: state,
    defaultQueryTimeoutMs: 3000,
  });

  store.bind(sock.ev);

  sock.ev.on("qr", (m) => sendToClient("qr", m, ws_client));

  const closeConn = async (sock) => {
    sock.ev.on("close", async () => {
      await sock?.destroy();
    });
    await sock?.end();
  };

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      // reconnect if not logged out
      let error = new Boom(lastDisconnect.error);
      switch (error?.output?.statusCode) {
        case DisconnectReason.connectionClosed:
          startSock(ws_client);
          await closeConn(sock);
          break;
        case DisconnectReason.connectionLost:
          await closeConn(sock);
          startSock(ws_client);
          break;
        case DisconnectReason.connectionReplaced:
          startSock(ws_client);
          await closeConn(sock);
          break;
        case DisconnectReason.timedOut:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          await delay(500);
          await closeConn(sock);
          startSock(ws_client);
          break;
        case DisconnectReason.loggedOut:
          if (__debug) console.log("Connection closed. You are logged out.");
          await delay(500);
          await sock.logout();
          await delay(500);
          await closeConn(sock);

          clearInterval(__i);
          fs.unlinkSync(folderStore + filenameStore + ".json");

          startSock(ws_client);

          break;
        case DisconnectReason.badSession:
          if (__debug) console.log("Connection closed. Bad session.");
          await delay(500);
          await sock.logout();
          await delay(500);
          await closeConn(sock);

          clearInterval(__i);
          fs.unlinkSync(folderStore + filenameStore + ".json");

          startSock(ws_client);

          break;
        case DisconnectReason.restartRequired:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          await closeConn(sock);
          startSock(ws_client);
          break;
        case DisconnectReason.multideviceMismatch:
          break;
        default:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          break;
      }
    }
    sendToClient("connection.update", update, ws_client);
  });
  // listen for when the auth credentials is updated
  sock.ev.on("creds.update", saveCreds);

  return sock;
};

export default async function handler(req, res) {
  try {
    let server;
    let params = req.query;

    if (res.socket.server.io) {
      if (__debug) console.log("Socket is already running");
      server = res.socket.server.io;
    } else {
      if (__debug) console.log("Socket is initializing");
      server = new Server(res.socket.server);
      server.setMaxListeners(0);
      server.listen(res.socket.server);
      res.socket.server.io = server;

      let filename = "";
      if (isset(params?.f) && !empty(params?.f)) {
        filenameStore = params.f;
        filename = params.f;
        console.log(filenameStore);
      }

      if (params?.logout) {
        try {
          //TODO: send logout signal to whatsapp server
          clearInterval(__i);
          fs.unlinkSync(folderStore + filenameStore + ".json");
        } catch (e) {
          console.error("Websocket connection error:", e);
        }
        res.end();
        return false;
      }

      server.of("/").on("connection", (socket) => {
        console.log("ws main channel connected");
        if (__debug) console.log("WebSocket client connected", socket.id);
      });

      server.of("/binance").on("connection", (socket) => {
        /*
        socket.on("upgrade", function (req, socket, head) {
          console.log({ req });
          if (req.url.indexOf("/_next/webpack-hmr") === -1) {
            socket.handleUpgrade(req, s, head, function done(ws) {
              socket.emit("connection", ws, req);
            });
          }
        });
        */
      
        socket.on("update", (data) => console.log("##### upgrade", data));
        socket.on("upgrade", (data) => console.log("##### upgrade", data));
        socket.on("connecting", (data) => console.log("##### Connecting", data));
        socket.on("reconnecting", (data) => console.log("##### Reconnecting", data));
        socket.on("connect_error", (err) => console.log("##### connect_error", err));
        socket.on("connect_failed", (err) => console.log("##### connect_failed", err));
        socket.on("disconnect", (err) => console.log("##### disconnect", err));
        socket.on("error", (err) => console.log("##### error", err));

        try {
          if (__debug) console.log("binance exclusive channel connected");
          if (__debug) console.log("WebSocket client connected", socket.id);
          binance.websockets.prevDay(["BTCUSDT","ETHUSDT"], (error, response) => {
            if (!error) sendToClient("prevDay", response, socket);
          });
        } catch (e) {
          console.error("Websocket connection error:", e);
        }
      });

      server.of("/whatsapp").on("connection", (socket) => {
        try {
          console.log("whatsapp exclusive channel connected");
          if (__debug) console.log("WebSocket client connected", socket.id);
          const s = startSock(socket, filename);
        } catch (e) {
          console.error("Websocket connection error:", e);
        }
      });
    }
    
    res.end();
  } catch (e) {
    if (__debug) console.log("WebSocket error", e);
    res.end();
  }
}
