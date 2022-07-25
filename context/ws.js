import React from "react";
import io from "socket.io-client";

const WsContext = React.createContext(null);
const WsProvider = ({ children }) => {
  let ws = {};
  try {
    if (!ws?.socket) {

      fetch("http://localhost:3000/api/ws", {
        method: "GET",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(resp => {

        ws.socket = io("http://localhost:3000/api/ws", { withCredentials: false, transports: ["websocket"] });
      });


    }
  } catch (error) {
    console.error(error);
  }

  return <WsContext.Provider value={ws}>{children}</WsContext.Provider>;
};

export { WsContext, WsProvider };
