import React, { useState } from "react";
import AdminContainer from "./layout/container";
import DataTable from "../../components/datatableMarketpairs";
import CryptoCard from "../../components/cardMarketpair";
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
        <CryptoCard
          symbol="BTCUSDT"
          timeframe="5m,15m,4h,1d"
          indicators={["stoch", "rsi"]}
        />
      </Row>
      <Row>
        {market_pairs ? <DataTable ticker={market_pairs} /> : "nothing"}
      </Row>
    </AdminContainer>
  );
}