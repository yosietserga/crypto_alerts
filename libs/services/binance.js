import { isset, empty } from "../../utils/common";

const ws = {};
const __data = {}; 

export function initSocketStream(store) {
  if (typeof store !== "undefined") {
    __data.store = store;
  }
}

export function getTickerBySymbol(data) {
  let ticker = {};

  data.forEach((item) => {
    let symbol = item.symbol || item.s;
    ticker[symbol] = {
      symbol: symbol,
      lastPrice: item.lastPrice || item.c,
      priceChange: item.priceChange || item.p,
      priceChangePercent: item.priceChangePercent || item.P,
      highPrice: item.highPrice || item.h,
      lowPrice: item.lowPrice || item.l,
      quoteVolume: item.quoteVolume || item.q,
    };
  });

  return ticker;
}

export function connectSocketStreams(streams) {
  streams = streams.join("/");

  let connection = btoa(streams);

  const binanceWS = __data.store.get("binanceWS");
  ws[connection] =
    binanceWS[connection] ??
    new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
  __data.store.set("binanceWS", ws);

  ws[connection].onmessage = (evt) => {
    let ticker = getTickerBySymbol(JSON.parse(evt.data).data);
    __data?.store.emit("UPDATE_MARKET_PAIRS", ticker);
  };

  ws[connection].onerror = (evt) => {
    console.error(evt);
    disconnectSocketStreams().then(()=>{
      connectSocketStreams("USDT");
    });
  };
}

export async function disconnectSocketStreams() {
  Object.keys(ws).map((conn) => {
    if (ws[conn].readyState === WebSocket.OPEN) {
      ws[conn].close();
    }
  });
  return true;
}