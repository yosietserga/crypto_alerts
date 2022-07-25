import {isset, empty } from "../../utils/common";
 const ws = {};
const __data = {}; 

export function initSocketStream(store) {
  if (typeof store !== "undefined") {
    __data.store = store;
  }
}

const getTick = (data) => {
  let __data = {};

  const indexes = {
    e: "eventType",
    E: "eventTime",
    s: "symbol",
    p: "priceChange",
    P: "percentChange",
    w: "averagePrice",
    c: "close",
    Q: "closeQty",
    o: "open",
    h: "high",
    l: "low",
    v: "volume",
    q: "quoteVolume",
    O: "openTime",
    C: "closeTime",
    F: "firstTradeId",
    L: "lastTradeId",
    n: "numTrades",
  };
       
  Object.keys(data).map(i => {
    __data[i.length === 1 ? indexes[i] : i] = data[i];
  });

  return __data;
}

export function getTickerBySymbol(data) {
  if (!isset(__data?.ticker)) __data.ticker = {};

  if (Array.isArray(data)) {
    data.forEach((item) => {
      let symbol = item.symbol || item.s;
      if (!isset(__data.ticker[symbol])) __data.ticker[symbol] = {};

      __data.ticker[symbol] = getTick(item);
    });
  } else if (typeof data.symbol !== "undefined") {
    let symbol = data.symbol || data.s;
    
    if (!isset(__data.ticker[symbol])) __data.ticker[symbol] = {};

    __data.ticker[symbol] = getTick(data);
  }

  return __data.ticker;
}

export function connectSocketStreams(streams) {
  streams = (!empty(streams) && Array.isArray(streams)) ? streams.join("/") : streams;
  
  if (empty(streams)) return false;

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