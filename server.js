const fs = require("fs");
const { Server } = require("socket.io");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { PrismaClient } = require("@prisma/client");
const BinanceServer = require("./serverBinance");
const WhatsappServer = require("./serverWhatsapp");
const { isset, empty, version_compare, log } = require("./utils/helpers");

const prisma = new PrismaClient();

const hostname = process.env.HOSTNAME ?? "localhost";
const port = process.env.PORT ?? 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const baseUrl = process.env.BASE_URL ?? "http://localhost";
const __debug = true;

const getParamsFromURI = (uri) => {
  const url = new URL(uri, baseUrl);
  return url.searchParams;
};

app.prepare().then(() => {
  let wss;
  const server = createServer((req, res) => {
    let url = req.url;
    const query = getParamsFromURI(url);

    if (res.socket.server.io) {
      if (__debug) console.log("Socket is already running");
      wss = res.socket.server.io;
    } else {
      if (__debug) console.log("Socket is initializing");
      wss = new Server(res.socket.server);
      res.socket.server.io = wss;

      wss.of("/").on("connection", (socket) => {
        console.log("ws main channel connected");

        if (__debug)
          console.log("WebSocket client connected for all ", socket.id);
      });

      wss.of("/binance").on("connection", (socket) => {
        console.log("ws binance channel connected");

        BinanceServer(socket, prisma);

        if (__debug)
          console.log("WebSocket client connected for binance ", socket.id);
      });

      wss.of("/whatsapp").on("connection", (socket) => {
        try {
          console.log("whatsapp server exclusive channel connected");
          if (__debug)
            console.log("WebSocket client connected for whatsapp ", socket.id);
          WhatsappServer(socket, prisma);
        } catch (e) {
          console.error("Websocket connection error:", e);
        }
      });
    }

    if (url.includes("_next/image") && !!query?.url) {
      url = query?.url;
    }

    if (url.includes("uploads/")) {
      const __path = url.includes("public/") ? url : "/public/" + url;
      fs.readFile(__dirname + __path, function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    } else {
      handle(req, res);
    }
  });
  
  /*
  server.on("upgrade", function (req, socket, head) {
    const { pathname } = parse(req.url, true);
    console.log("webscoket upgrade", pathname);
    if (!pathname.includes("_next/webpack-hmr")) {
      wss.handleUpgrade(req, socket, head, function done(ws) {
        wss.broadcast.emit("connection", ws, req);
      });
    }
  });
  */
  server.listen(port, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});