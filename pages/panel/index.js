import {useContext, useState, useCallback, useEffect} from "react";
import AdminContainer from "./layout/container";
import DataTable from "../../components/dashboard/datatableMarketpairs";
import CryptoCard from "../../components/dashboard/cardMarketpair";
import TradingViewTA from "../../components/dashboard/tradingViewTA";
import TradingViewTicker from "../../components/dashboard/tradingViewTicker";
import TradingViewChart from "../../components/dashboard/tradingViewChart";
import TradingViewTabs from "../../components/dashboard/tradingViewTabs";
import TradingViewSymbolInfo from "../../components/dashboard/tradingViewSymbolInfo";
import { Row, Col } from "reactstrap";
import { StoreContext } from "../../context/store";

export default function Stores() {
  const store = useContext(StoreContext);

  const [symbolSelected, setSymbolSelected] = useState();

  store.on("symbol:selected", symbol => {
    setSymbolSelected(symbol);
  });

  const CopyrightStyles = {
    parent: {
      display: "none",
      opacity: 0,
      height: "0px",
      width: "0px",
    },
    link: {
      display: "none",
      opacity: 0,
      height: "0px",
      width: "0px",
    },
    span: {
      display: "none",
      opacity: 0,
      height: "0px",
      width: "0px",
    },
  };

  return (
    <AdminContainer>
      <Row>
        <Col sm={3} className={`min-h-[220px] pr-0`}>
          <CryptoCard
            symbol="BTCUSDT"
            timeframe="5m,15m,4h,1d"
            indicators={["stoch", "rsi"]}
          />
          <DataTable />
        </Col>
        <Col sm={9} className={`min-h-[220px]`}>
          <TradingViewTicker copyrightStyles={CopyrightStyles} />

          {symbolSelected && (
            <>
              <TradingViewSymbolInfo
                copyrightStyles={CopyrightStyles}
                symbol={symbolSelected}
              />

              <TradingViewChart symbol={symbolSelected} />
            </>
          )}

          <Col sm={6} className={`px-0`}>
            <TradingViewTA
              copyrightStyles={CopyrightStyles}
              symbol={symbolSelected}
            />
          </Col>
          <Col sm={6} className={`px-0`}>
            {/*symbolSelected && (
              <TradingViewTabs
                copyrightStyles={CopyrightStyles}
                symbol={symbolSelected}
              />
            )*/}
            {!symbolSelected && (
              <div className={`mx-[15%] my-[50px]`}>
                Debe seleccionar un par para mostrar las alertas
              </div>
            )}
          </Col>
        </Col>
      </Row>
      <Row></Row>
    </AdminContainer>
  );
}