import React from "react";
import io from "socket.io-client";

const ws = {};
const PORT = process.env.PORT ?? 3000;
const HOST = process.env.BASE_URL ?? "http://localhost";
const baseurl = HOST + ":" + PORT;
const WsContext = React.createContext(null);

const WsProvider = ({ children }) => {
  fetch(baseurl+"/api/ws", {
    method: "GET",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const config = {
    withCredentials: false,
    transports: ["websocket"],
  };

  React.useEffect(() => {
    ws.socket = io("/", config);
    ws.whatsapp = io("/whatsapp", config);
    ws.binance = io("/binance", config);

    return () => {
      Object.keys(ws).map(i => {
        ws[i]?.disconnect();
        delete ws[i];
      });
    };
  }, []);

  return <WsContext.Provider value={ws}>{children}</WsContext.Provider>;
};

export { WsContext, WsProvider };
