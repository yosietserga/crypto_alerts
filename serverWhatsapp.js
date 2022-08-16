const { Boom } = require("@hapi/boom");
const fs = require("fs");
const makeWASocket = require("@adiwajshing/baileys");
const { isset, empty, version_compare, log } = require("./utils/helpers");

process.on("unhandledRejection", console.log);

const {
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
  BufferJSON,
} = makeWASocket;
const __debug = true;
const folderStore = "./temp/cache/whatsapp/";
let filenameStore = "";
const sessions = {};

const sendToClient = async (event, msg, wss) => {
  if (!wss) return false;

  wss?.broadcast?.emit(
    event,
    JSON.stringify({
      data: msg,
    })
  );
};

// start a connection
const WhatsappServer = async (wss, prisma, __filenameStore) => {
  
  const getDefaultAccount = async () => {
    return await prisma.post.findMany({
      where: {
        post_type: "whatsapp_account",
        status: 1,
      },
    });
  };

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

  const sock = makeWASocket.default({
    version,
    auth: __state,
    defaultQueryTimeoutMs: 3000,
  });

  sock.ev.on("qr", (m) => sendToClient("qr", m, wss));

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
          startSock(wss);
          await closeConn(sock);
          break;
        case DisconnectReason.connectionLost:
          await closeConn(sock);
          startSock(wss);
          break;
        case DisconnectReason.connectionReplaced:
          startSock(wss);
          await closeConn(sock);
          break;
        case DisconnectReason.timedOut:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          await delay(500);
          await closeConn(sock);
          startSock(wss);
          break;
        case DisconnectReason.loggedOut:
          if (__debug) console.log("Connection closed. You are logged out.");
          await delay(500);
          await sock.logout();
          await delay(500);
          await closeConn(sock);

          clearInterval(__i);
          fs.unlinkSync(folderStore + filenameStore + ".json");

          startSock(wss);

          break;
        case DisconnectReason.badSession:
          if (__debug) console.log("Connection closed. Bad session.");
          await delay(500);
          await sock.logout();
          await delay(500);
          await closeConn(sock);

          clearInterval(__i);
          fs.unlinkSync(folderStore + filenameStore + ".json");

          startSock(wss);

          break;
        case DisconnectReason.restartRequired:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          await closeConn(sock);
          startSock(wss);
          break;
        case DisconnectReason.multideviceMismatch:
          break;
        default:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          break;
      }
    }
    sendToClient("connection.update", update, wss);
  });

  // listen for when the auth credentials is updated
  sock.ev.on("creds.update", __saveCreds);

  // the process function lets you process all events that just occurred
  // efficiently in a batch
  sock.ev.process(
    // events is a map for event name => event data
    async (events) => {
      // something about the connection changed
      // maybe it closed, or we received all offline message or connection opened
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          // reconnect if not logged out
          if (
            lastDisconnect?.error?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            //startSock()
          } else {
            console.log("Connection closed. You are logged out.");
          }
        }

        console.log("connection update", update);
      }

      // credentials updated -- save them
      if (events["creds.update"]) {
        await __saveCreds();
      }

      if (events.call) {
        console.log("recv call event", events.call);
      }

      // chat history received
      if (events["chats.set"]) {
        const { chats, isLatest } = events["chats.set"];
        console.log(`recv ${chats.length} chats (is latest: ${isLatest})`);
        sendToClient("chats.set", events["chats.set"]);
      }

      // message history received
      if (events["messages.set"]) {
        const { messages, isLatest } = events["messages.set"];
        console.log(
          `recv ${messages.length} messages (is latest: ${isLatest})`
        );
        sendToClient("messages.set", events["messages.set"]);
      }

      if (events["contacts.set"]) {
        const { contacts, isLatest } = events["contacts.set"];
        console.log(
          `recv ${contacts.length} contacts (is latest: ${isLatest})`
        );
      }

      // received a new message
      if (events["messages.upsert"]) {
        const upsert = events["messages.upsert"];
        console.log("recv messages ", JSON.stringify(upsert, undefined, 2));
        sendToClient("messages.upsert", events["messages.upsert"]);

        if (upsert.type === "notify") {
          for (const msg of upsert.messages) {
            if (!msg.key.fromMe) {
              console.log("replying to", msg.key.remoteJid);
              await sock.sendReadReceipt(
                msg.key.remoteJid,
                msg.key.participant,
                [msg.key.id]
              );
              //await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
            }
          }
        }
      }

      // messages updated like status delivered, message deleted etc.
      if (events["messages.update"]) {
        console.log(events["messages.update"]);
      }

      if (events["message-receipt.update"]) {
        console.log(events["message-receipt.update"]);
      }

      if (events["messages.reaction"]) {
        console.log(events["messages.reaction"]);
      }

      if (events["presence.update"]) {
        console.log(events["presence.update"]);
      }

      if (events["chats.update"]) {
        console.log(events["chats.update"]);
      }

      if (events["chats.delete"]) {
        console.log("chats deleted ", events["chats.delete"]);
      }
    }
  );

  return sock;
};

module.exports = WhatsappServer;