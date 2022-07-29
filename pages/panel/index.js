import AdminContainer from "./layout/container";
import DataTable from "../../components/datatableMarketpairs";
import CryptoCard from "../../components/cardMarketpair";
import { Row } from "reactstrap";
//import { WsContext } from "../../context/ws";
//import { isset, empty, delay } from "../../utils/common";

let isLoaded;

export default function Stores() {
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
        <DataTable />
      </Row>
    </AdminContainer>
  );
}