import {useState, useEffect, useCallback, useContext} from "react";
import qr from "qr-image";
import io from "socket.io-client";
import { empty, doUntil, isset, log } from "../../../utils/common";
import { StoreContext } from "../../../context/store";
import { WsContext } from "../../../context/ws";

let i;
let _i;
let isLoaded;
let lastFilename;

const PORT = process.env.PORT ?? 3000;
const HOST = process.env.BASE_URL ?? "http://localhost";
const baseurl = HOST + ":" + PORT;
let __i = null;
const WhatsappQR = (props) => {
  const { filename } = props;
  const [qrImage, setQR] = useState();
  const [connObject, setConnection] = useState({});
  const [isConnected, setConnected] = useState(true);
  const [connectionUpdated, setConnectionUpdated] = useState(false);
  const [sentBack, setSent] = useState(false);

  const ws = useContext(WsContext);
  const store = useContext(StoreContext);

  const loadWS = useCallback(async () => {
    if (!empty(filename)) {
      setTimeout(() => {
        console.log(process.env.BASE_URL);

        fetch( "/?wa_filename=" + filename);
      }, 1000 * 2);
    }
  }, [filename, ws]);

  useEffect(() => {
    loadWS();

    if (!isLoaded || lastFilename !== filename) {
      isLoaded = lastFilename === filename;
      lastFilename = filename;
    }

    if (ws?.whatsapp) {
      ws?.whatsapp?.on("error", (msg) => {
        log("error", msg);
      });

      ws?.whatsapp?.on("connection", (msg) => {
        const {data} = JSON.parse(msg);
        if (data?.connection === "connected") {
          setTimeout(() => {
            console.log("sending message to server ...");
            if (!sentBack) {
              /*
              ws?.whatsapp?.emit(
                "send",
                JSON.stringify({
                  body: { text: "Hello World" },
                  id: "someidforworkflowcontrol",
                })
              );
              setSent(true);
              */
            }
          }, 1000 * 20);
        }
        if (data?.connection === "disconnected") {
        }
        if (data?.connection === "connecting") {
        }
        log("connection", data);
      });

      ws?.whatsapp?.on("open", (msg) => {
        log("opened", msg);
      });

      ws?.whatsapp?.on("close", (msg) => {
        log("closed", msg);
      });

      ws?.whatsapp?.on("sent", (msg) => {
        log("SENT", JSON.parse(msg));
        setSent(false);
      });

      ws?.whatsapp?.on("connection.update", (m) => {
        let { data } = JSON.parse(m);

        if (data?.qr) {
          if (i) {
            clearTimeout(i);
            i = null;
          }
          i = setTimeout(() => {
            let code = qr.imageSync(data.qr, { type: "svg" });
            setQR(code);
          }, 1000);
        } else {
          setQR(false);
          setConnection(data);
          if (data.connection==="open") {
            
          }
        }
      });
    }
  }, [ws, loadWS, isConnected, setConnected, filename, sentBack, setSent]);

  const handleWALogout = (e) => {
    fetch(baseurl + "/?wa_logout=1");
  };

  if (!qrImage) {
    return (
      <>
        <button
          type="button"
          className="bg-blue-800 w-full sm:w-auto font-bold uppercase text-xs rounded py-2 px-2 text-white shadow-md"
          onClick={handleWALogout}
        >
          Logout from whatsApp
        </button>
        <h3>WhatsApp connection Status:</h3>
        <p
          style={{
            background: "#fff",
            border: "solid 1px #eee",
            padding: "10px",
            margin: "10px",
          }}
        >
          <strong>session: {filename}</strong>
        </p>
        <ul
          style={{
            border: "solid 1px #eee",
            padding: "10px",
            margin: "10px",
          }}
        >
          {Object.keys(connObject).map((i) => {
            return (
              <li key={i}>
                - {i}: {JSON.stringify(connObject[i])}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <>
      <div
        dangerouslySetInnerHTML={{ __html: qrImage }}
        style={{
          maxWidth: "250px",
          background: "#fff",
          border: "solid 1px #eee",
          padding: "10px",
          margin: "10px",
        }}
      />
      <p
        style={{
          background: "#fff",
          border: "solid 1px #eee",
          padding: "10px",
          margin: "10px",
        }}
      >
        <strong>session: {filename}</strong>
      </p>
    </>
  );
};

export default WhatsappQR;
