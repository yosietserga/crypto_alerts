const TelegramBot = require("node-telegram-bot-api");
const { isset, empty, version_compare, log } = require("./utils/helpers");

const token = "5398854148:AAEJK__x7vlfLKMNoVK8rNyl74b_jdI6AE0";
const __debug = false;

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
      post_type: "telegram_account",
      status: 1,
    },
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
    console.log({ err });
  }
};

const availableCommands = [
	{
		command:"alert",
		fn:"fnAlert",
		plugin:"alerts"
	}
];

const commandIsAvailable = (command) => {
  command = command.replace("/", "");
  if (!empty(command)) {
    for (let cmd of availableCommands) {//TODO: load from DB 
      if (command === cmd.command) {
        return true;
      }
    }
  }
}

const loadCommand = async (command) => {
  try {
    if (commandIsAvailable(command)) {
      const plugin = await import(pluginGeneralPath + cmd.plugin);//TODO:use memoize for the plugin 
      if (plugin && isset(plugin[cmd.fn]) && typeof plugin[cmd.fn] === "function") {
        return plugin[cmd.fn];
      }
    }
    return false;
  } catch (err) {
    console.log("ERROR: ", err);
  }
}

const execCommand = async (command, context, cb) => {
  // check if plugin folder exists 
  // check if DB settings exists 
  // check if plugin::command exists  
  // who can call this command 
  // has permissions to call this command 
  const fnCommand = await loadCommand(command);
  if (fnCommand) {
    fnCommand(context).then(cb);
  }
}

// start a connection
const TelegramServer = async (wss, prisma) => {
  
  const sock = new TelegramBot(token, { polling: true });
  console.log(sock);
  sock.on("polling_error", function (error) {
    console.log(error);
  });

  sock.onText(/^\/[a-z\d]+/gi, async (msg, match) => {
    console.log("telegram received message with command ", [msg, match]);
    let command = match[0];
    var chatId = msg.chat.id;
    var nameUser = msg.from.first_name;

    sock.sendMessage(chatId, `Using command [${command}] for ${nameUser}`);
    /*
    execCommand(command, msg, (resp) => {
      sock.sendMessage(chatId, `Using this command [${command}] for ${nameUser}`);
    });
    */
  });

  global.store.on("tg:logout", async () => {
  });

  global.store.on("send", async (msg) => {
    const { body, id } = msg;
    if (__debug) console.log("parsing data to send from client", body, id);
  });

  wss.on("send", async (msg) => {
    const { body, id } = JSON.parse(msg);
    if (__debug) console.log("parsing data to send from client", body, id);
  });

  sock.sendMessageWTyping = sendMessageWTyping;

  return sock;
};

module.exports = TelegramServer;
