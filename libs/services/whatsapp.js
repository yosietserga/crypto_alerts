import P from "pino";
import WASocket from "@adiwajshing/baileys";
import { isset, empty, delay } from "../../utils/common";

const {
  makeInMemoryStore,
  useSingleFileAuthState,
  fetchLatestBaileysVersion,
} = WASocket;

const makeWASocket = WASocket.default;
const { Boom } = HapiBoom;
const __debug = false;

const { DisconnectReason } = WASocket;

const OnConnection = async (update, sock) => {
  const { connection, lastDisconnect } = update;

  const closeConn = async (sock, cb) => {
    sock.ev.on("close", async () => {
      await sock?.destroy();
      if (typeof cb === "function") cb();
    });
    await sock?.end();
  };

  try {
    if (connection === "close") {
      // reconnect if not logged out
      let error = new Boom(lastDisconnect.error);

      await closeConn(sock, startSock);

      switch (error?.output?.statusCode) {
        case DisconnectReason.connectionClosed:
          break;
        case DisconnectReason.connectionLost:
          break;
        case DisconnectReason.connectionReplaced:
          break;
        case DisconnectReason.timedOut:
          break;
        case DisconnectReason.loggedOut:
          if (__debug) console.log("Connection closed. You are logged out.");
          await delay(500);
          await sock.logout();
          break;
        case DisconnectReason.badSession:
          if (__debug) console.log("Connection closed. Bad session.");
          await delay(500);
          await sock.logout();
          break;
        case DisconnectReason.restartRequired:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          break;
        case DisconnectReason.multideviceMismatch:
          break;
        default:
          if (__debug)
            console.log("Connection closed. Error:" + JSON.stringify(error));
          break;
      }
    }
  } catch (err) {
    console.log("Connection Error:" + JSON.stringify(err));
  }
};

const getMessageType = (messageObj) => {
  if (typeof messageObj != "object" || !messageObj) return false;

  const types = {
    text: "conversation",
    extended: "extendedTextMessage",
    contact: "contactMessage",
    contactsArray: "contactsArrayMessage",
    groupInvite: "groupInviteMessage",
    list: "listMessage",
    buttons: "buttonsMessage",
    location: "locationMessage",
    liveLocation: "liveLocationMessage",
    protocol: "protocolMessage",
    image: "imageMessage",
    video: "videoMessage",
    sticker: "stickerMessage",
    document: "documentMessage",
    audio: "audioMessage",
    product: "productMessage",
  };

  for (let t in types) {
    if (typeof messageObj[types[t]] != "undefined" && !!messageObj[types[t]])
      return t;
  }
  return false;
};

const getTextMessage = (messageObj) => {
  if (!messageObj || typeof messageObj === "undefined") return false;
  const type = getMessageType(messageObj);
  if (__debug) console.log({ messageType: type }, messageObj);
  if (type == "text") return messageObj.conversation;
  if (type == "extended" && !!messageObj?.extendedTextMessage?.text)
    return messageObj.extendedTextMessage.text;
  if (
    typeof messageObj[type]?.caption != "undefined" &&
    !!messageObj[type]?.caption
  )
    return messageObj[type].caption;

  return false;
};

const walkThroughChats = () => {
  let messages = store.messages;
  for (let chatId in messages) {
    let m = messages[chatId].toJSON()[0];
    if (__debug) console.log("walkThroughChats", chatId);

    followBotMessage(m, chatId);
  }
};

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({
  logger: P().child({ level: "debug", stream: "store" }),
});
store.readFromFile("./baileys_store_multi.json");
// save every 10s
setInterval(() => {
  store.writeToFile("./baileys_store_multi.json");
}, 10_000);

// eslint-disable-next-line react-hooks/rules-of-hooks
const { state, saveState } = useSingleFileAuthState("./auth_info_multi.json");

// start a connection
export async function startSock() {
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  if (__debug)
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: state,
  });

  store.bind(sock.ev);

  const sendMessageWTyping = async (msg, jid, opts, m) => {
    try {
      await sock.presenceSubscribe(jid);
      await delay(500);

      await sock.sendPresenceUpdate("composing", jid);
      await delay(2000);

      await sock.sendPresenceUpdate("paused", jid);
      const r = await sock.sendMessage(jid, msg, opts);
      if (r.status === 1) {
        console.log("message wa sent", r);
        //TOOD: should resolve promise or callback 
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveMessages = (data) => {
    for (let i in data.messages) {
      let m = data.messages[i];
      if (
        !m?.key.fromMe &&
        m?.key.remoteJid.indexOf("@broadcast") === -1 && //not statuses
        m?.key.remoteJid.indexOf("@g.us") === -1 //not groups
      ) {
        createMessage(m?.key.id, m?.key.remoteJid, getMessageType(m), m);
        //TOOD: should resolve promise or callback
      }
    }
  };

  sock.ev.on("messages.upsert", saveMessages);
  sock.ev.on("messages.update", saveMessages);

  sock.ev.on("connection.update", (data) => {
    OnConnection(data, sock);
  });

  sock.ev.on("creds.update", saveState);

  return sock;
}

startSock();
