const { Boom } = require("@hapi/boom");
const fs = require("fs");
const makeWASocket = require("@adiwajshing/baileys");
const { isset, empty, version_compare, log } = require("./utils/helpers");
const pino = require("pino");
process.on("unhandledRejection", console.log);

const { delay, DisconnectReason, useMultiFileAuthState, BufferJSON, Browsers } = makeWASocket;
const __debug = false;
const folderStore = "./temp/cache/whatsapp/";
const sessions = {};
let currentSession = null;

const sendToClient = async (event, msg, wss) => {
  if (!wss) return false;

  wss?.broadcast?.emit(
    event,
    JSON.stringify({
      data: msg,
    })
  );
};

const getDefaultAccount = async (prisma) => {
  return await prisma.post.findMany({
    where: {
      post_type: "whatsapp_account",
      status: 1,
    },
  });
};

const rmFilename = (filename) => {
  fs.rm(folderStore + filename, { recursive: true, force: true }, (err) => {
    if (err) {
      throw err;
    }
  });
};

const closeConn = async (sock) => {
  sock.ev.on("close", async () => {
    await sock?.destroy();
  });
  await sock?.end();
};


const sendMessageWTyping = async (sock, jid, msg, opts) => {
      try {
        console.log("message wa sending", [jid, msg]);
        await sock.presenceSubscribe(jid);
        await delay(500);
        await sock.sendPresenceUpdate("composing", jid);
        await delay(2000);
        await sock.sendPresenceUpdate("paused", jid);

        const r = await sock.sendMessage(jid, msg, opts);

        if (r.status === 1) {
          console.log("message wa sent", r);
          //TODO: queue of actions to do after send message successfully
        } else {
          //TODO: queue of actions to do after fail sending message
          //TODO: put here retry send logic
          //emit send failure to clients
          console.log("ERROR:", r);
        }

        return r;
      } catch (err) {
        console.log({err});
      }
};

// start a connection
const WhatsappServer = async (wss, prisma) => {
  global.store.on("wa:filename", async (filename) => {
    //create temp dir if not exists
    if (!fs.existsSync(folderStore + filename)) {
      fs.mkdirSync(folderStore + filename, {
        recursive: true,
      });
    }

    //initiate session var if does not exists
    if (!isset(sessions[filename])) {
      sessions[filename] = {};
    }

    //reconnect if session name changes
    if (currentSession && currentSession !== filename) {
      await closeConn(sock);
      WhatsappServer(wss, prisma);
    }
    currentSession = filename;
  });

  const f = currentSession;

  if (empty(f)) {
    sendToClient("connection", { connection: "disconnected" }, wss);
    return false;
  } else if (sessions[f]?.state?.creds?.me) {
    sendToClient(
      "connection",
      { connection: "connected", me: sessions[f]?.state?.creds?.me },
      wss
    );
  } else {
    sendToClient("connection", { connection: "connecting" }, wss);
  }

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

  const sock = makeWASocket.default({
    auth: __state,
    defaultQueryTimeoutMs: 3000,
    printQRInTerminal: true,
    browser: Browsers.ubuntu("Desktop"),
    syncFullHistory: true,
    logger: pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    }),
  });
  //wait for socket ready
  delay(3000);
  currentSession = f;
  // listen for when the auth credentials is updated
  sock.ev.on("creds.update", __saveCreds);
  sock.ev.on("qr", (m) => sendToClient("qr", m, wss));

  const restart = async (sock, wss, prisma) => {
    if (__debug)
      console.log("Restarting WA socket...");
    await sock.ev.removeAllListeners();
    await closeConn(sock);
    await delay(5000);
    wss.off("send", ()=>{});
    global.store.set({ wa_connection:"closed" });
    return await WhatsappServer(wss, prisma);
  };

  const reset = async (sock, wss, prisma) => {
    if (__debug) console.log("Destroying WA socket and reseting session...");
    await delay(500);
    await sock.logout();
    await delay(5000);
    await sock.ev.removeAllListeners();
    await closeConn(sock);
    rmFilename(f);
    global.store.set({ wa_connection:"closed" });
    await delay(5000);
    return await WhatsappServer(wss, prisma);
  };
    
  global.store.on("wa:logout", async () => {
    sessions[f] = {};
    reset(sock, wss, prisma);
    rmFilename(f);
  });
    
  global.store.on("send", async (msg) => {
    const { body, id } = msg;
    if (__debug)
      console.log("parsing data to send from client", body, id);
    sendMessageWTyping(sock, sock?.authState?.creds?.me?.id, body).then(
      (result) => {
        if (result?.status === 1) {
          //TODO: queue workflow to process post send 
        }
      }
    );
  });

  

  sock.ev.on("connection.update", async (update) => {
    const { 
      connection, //string 
      lastDisconnect, //object
      receivedPendingNotifications, //boolean
      isOnline, //boolean 
    } = update;
    if (__debug)
      console.log(
        "Connection UPDATE:",
        JSON.stringify({ connection, lastDisconnect })
      );
    if (connection === "close") {
      // reconnect if not logged out
      let error = new Boom(lastDisconnect.error);
      switch (error?.output?.statusCode) {
        case DisconnectReason.connectionClosed:
        case DisconnectReason.connectionLost:
        case DisconnectReason.connectionReplaced:
        case DisconnectReason.timedOut:
        case DisconnectReason.restartRequired:
        case DisconnectReason.multideviceMismatch:
        default:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          return await restart(sock, wss, prisma);

          break;
        case DisconnectReason.loggedOut:
          if (__debug) console.log("Connection closed. You are logged out.");
          return await reset(sock, wss, prisma);
          break;
        case DisconnectReason.badSession:
          if (__debug) console.log("Connection closed. Bad session.");
          return await reset(sock, wss, prisma);
          break;
      }
    }
    if (connection === "connecting" || receivedPendingNotifications === false) {
      global.store.set({ wa_connection:"closed" });
    }
    if (connection === "open") {
      global.store.set({ wa_connection:"open" });
    }
    sendToClient("connection.update", update, wss);
  });

  wss.on("send", async (msg) => {
    const { body, id } = JSON.parse(msg);
    if (__debug) console.log("parsing data to send from client", body, id);
    sendMessageWTyping(
      sock,
      sock?.authState?.creds?.me?.id,
      body
    ).then(result => {
      if (result?.status === 1) {
        //TODO: send ws message to client
        sendToClient( "sent", { id, result }, wss );
      }
    });
  });

  sock.ev.on("event", (map) => {
    for (const event in map) {
      global?.store.emit("whatsapp:" + event, map[event]);
    }
  });

  global?.store.on("beforeAll", (eventName, state) => {
    if (eventName.startsWith("whatsapp")) {
      sendToClient(eventName.replace("whatsapp",""), state, wss);
    }
  });

  sock.ev.process(async (events) => {
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
      console.log(`recv ${messages.length} messages (is latest: ${isLatest})`);
      sendToClient("messages.set", events["messages.set"]);
    }

    if (events["contacts.set"]) {
      const { contacts, isLatest } = events["contacts.set"];
      console.log(`recv ${contacts.length} contacts (is latest: ${isLatest})`);
    }

    // received a new message
    if (events["messages.upsert"]) {
      global.store.set({ wa_connection:"open" });
      const upsert = events["messages.upsert"];
      console.log("recv messages ", JSON.stringify(upsert, undefined, 2));
      sendToClient("messages.upsert", events["messages.upsert"]);

      if (upsert.type === "notify") {
        for (const msg of upsert.messages) {
          if (!msg.key.fromMe) {
            console.log("replying to", msg.key.remoteJid);
            await sock.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [
              msg.key.id,
            ]);
            //await sendMessageWTyping(sock, msg.key.remoteJid, { text: 'Hello there!' });
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
      global.store.set({ wa_connection:"open" });
    }

    if (events["chats.update"]) {
      console.log(events["chats.update"]);
      global.store.set({ wa_connection:"open" });
    }

    if (events["chats.delete"]) {
      console.log("chats deleted ", events["chats.delete"]);
    }
  });

  sock.sendMessageWTyping = sendMessageWTyping;
  sock.restart = restart;
  sock.reset = reset;

  return sock;
};

module.exports = WhatsappServer;