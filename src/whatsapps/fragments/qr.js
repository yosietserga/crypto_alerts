import React from "react";
import qr from "qr-image";
import { WsContext } from "../../../context/ws";
import { empty, isset } from "../../../utils/common";

let i;
let isLoaded;
let lastFilename;

const WhatsappQR = (props) => {
  const { filename } = props;
  const [qrImage, setQR] = React.useState();

  if (!empty(filename)) {    
    fetch("http://localhost:3000/api/ws?f="+ filename);
  }

  const ws = React.useContext(WsContext);

  React.useEffect(() => {
    if (!isLoaded || lastFilename !== filename) {
      isLoaded = lastFilename === filename;
      lastFilename = filename;

      ws.socket.on("whatsapp.connection.update", (m) => {
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
        } else if (data.connection === "close") {
          setQR(false);
        } else if (data.connection === "open") {
          setQR(false);
        } else {
          setQR(false);
        }
      });
    }
  }, [ws, filename]);

  const handleWALogout = (e) => {
    fetch("http://localhost:3000/api/ws?logout=1");
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
      </>
    );
  }

  return (
    <>
      <div
        dangerouslySetInnerHTML={{ __html: qrImage }}
        style={{ maxWidth: "250px" }}
      />
    </>
  );
};

export default WhatsappQR;
