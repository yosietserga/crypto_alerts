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

process.on("unhandledRejection", console.log);

const __debug = true;
const folderStore = "./temp/cache/whatsapp/";
let filenameStore = "";
const sessions = {};

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
  const f = !empty(__filenameStore) ? __filenameStore : filenameStore;
  
  console.log(f, sessions);
  if (empty(f)) return false;

  let __state;
  let __saveCreds;

  if (isset(sessions[f]?.state)) {
    __state = sessions[f].state;
    __saveCreds = sessions[f].saveCreds;
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { state, saveCreds } = await useMultiFileAuthState(folderStore + f);
    __state = state;
    __saveCreds = saveCreds;
    
    sessions[f] = { state, saveCreds };
  }


  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  if (__debug)
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: __state,
    defaultQueryTimeoutMs: 3000,
  });

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
  sock.ev.on("creds.update", __saveCreds);



// the process function lets you process all events that just occurred
	// efficiently in a batch
	sock.ev.process(
		// events is a map for event name => event data
		async(events) => {
			// something about the connection changed
			// maybe it closed, or we received all offline message or connection opened
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if(connection === 'close') {
					// reconnect if not logged out
					if((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
						//startSock()
					} else {
						console.log('Connection closed. You are logged out.')
					}
				}

				console.log('connection update', update)
			}

			// credentials updated -- save them
			if(events['creds.update']) {
				await __saveCreds()
			}

			if(events.call) {
				console.log('recv call event', events.call)
			}

			// chat history received
			if(events['chats.set']) {
				const { chats, isLatest } = events['chats.set']
				console.log(`recv ${chats.length} chats (is latest: ${isLatest})`)
        sendToClient("chats.set", events["chats.set"]);
			}

			// message history received
			if(events['messages.set']) {
				const { messages, isLatest } = events['messages.set']
				console.log(`recv ${messages.length} messages (is latest: ${isLatest})`)
        sendToClient("messages.set", events["messages.set"]);

			}

			if(events['contacts.set']) {
				const { contacts, isLatest } = events['contacts.set']
				console.log(`recv ${contacts.length} contacts (is latest: ${isLatest})`)
			}

			// received a new message
			if(events['messages.upsert']) {
				const upsert = events['messages.upsert']
				console.log('recv messages ', JSON.stringify(upsert, undefined, 2))
        sendToClient("messages.upsert", events["messages.upsert"]);


				if(upsert.type === 'notify') {
					for(const msg of upsert.messages) {
						if(!msg.key.fromMe) {
							console.log('replying to', msg.key.remoteJid)
							await sock.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
							//await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
						}
					}
				}
			}

			// messages updated like status delivered, message deleted etc.
			if(events['messages.update']) {
				console.log(events['messages.update'])
			}

			if(events['message-receipt.update']) {
				console.log(events['message-receipt.update'])
			}

			if(events['messages.reaction']) {
				console.log(events['messages.reaction'])
			}

			if(events['presence.update']) {
				console.log(events['presence.update'])
			}

			if(events['chats.update']) {
				console.log(events['chats.update'])
			}

			if(events['chats.delete']) {
				console.log('chats deleted ', events['chats.delete'])
			}
		}
	);

  return sock;
};

export default async function handler(req, res) {
  try {
    let server;
    let params = req.query;

    let filename = "";
    if (isset(params?.f) && !empty(params?.f)) {
      filenameStore = params.f;
      filename = params.f;
      if (!isset(sessions[filename])) {
        sessions[filename] = {};
      }
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
    /*
    if (res.socket.server.io) {
      if (__debug) console.log("Socket is already running");
      server = res.socket.server.io;
    } else {
      if (__debug) console.log("Socket is initializing");
      server = new Server(res.socket.server);
      server.setMaxListeners(0);
      server.listen(res.socket.server);
      res.socket.server.io = server;
      server.of("/").on("connection", (socket) => {
        console.log("ws main channel connected");
        if (__debug) console.log("WebSocket client connected", socket.id);
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
    */

    res.end();
  } catch (e) {
    if (__debug) console.log("WebSocket error", e);
    res.end();
  }
}
