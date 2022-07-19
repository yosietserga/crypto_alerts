import React, { useState } from "react";
import AdminContainer from "./layout/container";
import DataTable from "../../components/datatableMarketpairs";
import { Row } from "reactstrap";
import { StoreContext } from "../../context/store";
import { isset, empty, delay } from "../../utils/common";
import {
  initSocketStream,
  connectSocketStreams,
} from "../../libs/services/binance";

export default function Stores() {
  const [market_pairs, setMarketPairs] = useState({});

  const store = React.useContext(StoreContext);

  store.on("UPDATE_MARKET_PAIRS", (data) => {
    try {
      setMarketPairs(data);
    } catch(err) {
      console.log(err);
    }
  });

  initSocketStream(store);

  React.useEffect(() => {
    connectSocketStreams(["!ticker@arr"]);
  }, []);
  
  return (
    <AdminContainer>
      <h1>Market Pairs</h1>

      <Row>
        {market_pairs ? <DataTable ticker={market_pairs} /> : "nothing"}
      </Row>
    </AdminContainer>
  );
}


export async function getServerSideProps(ctx) {
  const Binance = require("node-binance-api");
   
   const binance = new Binance();

   const markets = [];

  //load all markets to watch 
  binance.prevDay(false, (error, prevDay) => {
    for (let obj of prevDay) {
      //TODO: apply symbol filters to only load crypto alerts 
      let symbol = obj.symbol;
      markets.push(symbol);
    }
  });

  await delay(2000);
  console.log(markets);
  
  for (let symbol of markets) {
   binance.candlesticks(symbol, "5m", function (error, ticks) {
     if (!empty(ticks)) {
        console.log("candlesticks(symbol)", symbol, ticks);

        let last_tick = ticks[ticks.length - 1];

        let [
          time,
          open,
          high,
          low,
          close,
          volume,
          closeTime,
          assetVolume,
          trades,
          buyBaseVolume,
          buyAssetVolume,
          ignored,
        ] = last_tick;
        console.log(symbol +" last close: " + close);
      }
   });
  }
   
  return {
    props: {
      
    },
  };
}
