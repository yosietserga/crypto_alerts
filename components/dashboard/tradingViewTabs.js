import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Col, Button, TabPane, TabContent } from "reactstrap";
import { MarketOverview } from "react-ts-tradingview-widgets";

const CoinmarketCapApi = axios.create({
  baseURL:"https://pro-api.coinmarketcap.com",
  method: "GET",
  headers:{
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "X-CMC_PRO_API_KEY": "371522d7-073d-4b0f-a215-27d75cbecf69",
  },
});

export default function TradingViewTabs(props) {
  const { copyrightStyles, symbol } = props;
  const [activeTab, setActiveTab] = useState();

  const toggleTab = (tabName) => {
    setActiveTab(tabName);
  };

  //modal controls
  const [__view, setView] = useState(false);
  const loadAll = useCallback(async () => {
    let info = {};
    try {
      console.log(
        await CoinmarketCapApi("/v2/cryptocurrency/info", {
          params: {
            symbol: symbol.replace("USDT", ""),
          },
        })
      );
    } catch(err) {
      console.log(err);
    }

    setView(
      <>
        <Col sm={12} className={`px-0`}>
          <Button
            onClick={() => {
              toggleTab("info");
            }}
          >
            Info
          </Button>
          <Button
            onClick={() => {
              toggleTab("alerts");
            }}
          >
            Alerts
          </Button>
          <Button
            onClick={() => {
              toggleTab("markets");
            }}
          >
            Markets
          </Button>
        </Col>
        <Col sm={12} className={`px-0 min-h-[36rem]`}>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="info" className={`min-h-[36rem]`}>
              {JSON.stringify(info)}
            </TabPane>
            <TabPane tabId="alerts" className={`min-h-[36rem]`}>
              alerts
            </TabPane>
            <TabPane tabId="markets" className={`min-h-[36rem]`}>
              <MarketOverview
                colorTheme={"dark"}
                copyrightStyles={copyrightStyles}
                locale="en"
                width="100%"
                timezone="America/New York"
              />
            </TabPane>
          </TabContent>
        </Col>
      </>
    );
  }, [setView, copyrightStyles, symbol, activeTab]);

  useEffect(loadAll, [loadAll]);

  return <>{__view}</>;
}