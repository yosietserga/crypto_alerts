import React, { useState } from "react";
import AdminContainer from "./layout/container";
import DataTable from "../../components/datatableMarketpairs";
import { Row } from "reactstrap";
import { StoreContext } from "../../context/store";
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